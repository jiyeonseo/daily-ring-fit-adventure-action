const Twitter = require("twitter");
const fs = require("fs");
const dayjs = require("dayjs");
const simpleGit = require("simple-git");
const core = require("@actions/core");
const axios = require("axios");
const rimraf = require("rimraf");

const naver_ocr_url = core.getInput("naver_ocr_url");
const naver_ocr_secret_key = core.getInput("naver_secret_key");

var client = new Twitter({
  consumer_key: core.getInput("twt_consumer_key"),
  consumer_secret: core.getInput("twt_consumer_secret"),
  access_token_key: "",
  access_token_secret: "",
});

const USER = "jiyeonseo";
const ACCESS_TOKEN = core.getInput("github_access_token");
const REPO = "github.com/jiyeonseo/ring-fit-adventure-exercise-log";
const remote = `https://${USER}:${ACCESS_TOKEN}@${REPO}`;

let fileappend = function (twt) {
  var today = dayjs();
  return new Promise((resolve) => {
    var created_at = dayjs(twt.created_at);
    var result_img = twt.entities.media[0].media_url;
    const headers = {
      "Content-Type": "application/json",
      "X-OCR-SECRET": naver_ocr_secret_key,
    };
    const form = {
      images: [
        {
          format: "jpg",
          name: "demo",
          url: result_img,
        },
      ],
      requestId: today.millisecond().toString() + "RFA",
      version: "V2",
      timestamp: today.millisecond().toString(),
    };
    try {
      axios({
        method: "POST",
        headers: headers,
        data: form,
        url: naver_ocr_url,
      }).then((response) => {
        const data = response.data;

        if (data.images[0].inferResult == "SUCCESS") {
          var time = "";
          var cal = "";
          var distance = "";

          data.images[0].fields.forEach((field) => {
            if (field.name == "time") {
              time = field.inferText.replace(/\s/gi, "");
              if (time.includes("min")) {
                // 영문 파싱 이상
                time =
                  time.substring(0, 2) + "분 " + time.substring(3, 5) + "초";
              }
            } else if (field.name == "kal") {
              cal = field.inferText;
              if (cal.includes("Cal")) {
                // 영문 파싱 이상
                cal.replace("Cal", "kcal");
              }
            } else if (field.name == "distance") {
              distance = field.inferText;
            }
          });
          const readmetxt = `| ${created_at
            .add(9, "hour")
            .format(
              "YYYY-MM-DD"
            )} | ${time} | ${cal} | ${distance} | ![](${result_img.replace(
            "http",
            "https"
          )}) |\n`;
          console.log(readmetxt);
          const csvtxt =
            created_at.add(9, "hour").format("YYYY-MM-DD") +
            "," +
            (parseInt(time.substring(0, 2)) * 60 +
              parseInt(time.substring(3, 5))) +
            "," +
            cal.trim().slice(0, -4) +
            "," +
            distance.trim().slice(0, -2) +
            "\n";
          console.log(csvtxt);

          fs.appendFileSync(__dirname + "/tmp/ringfit.csv", csvtxt);
          fs.appendFileSync(__dirname + "/tmp/README.md", readmetxt);

          resolve("saved");
        }
      });
    } catch (err) {
      console.log("err", err);
    }
  });
};

async function getTwit() {
  return new Promise((resolve) => {
    var params = {
      screen_name: "seojeee",
      count: 100,
      trim_user: true,
      exclude_replies: true,
      include_rts: false,
    };
    return client.get(
      "statuses/user_timeline",
      params,
      function (error, tweets) {
        if (!error) {
          resolve(tweets);
        }
      }
    );
  });
}

async function run() {
  try {
    if (fs.existsSync(__dirname + "/tmp")) {
      rimraf.sync(__dirname + "/tmp");
    }

    const git = simpleGit();

    await git
      .clone(remote, __dirname + "/tmp")
      .exec(() => console.log("Git cloned"));

    const tweets = await getTwit();

    const todays = tweets.filter((twt) => {
      if (twt.text.includes("#RingFitAdventure")) {
        const created_at = dayjs(twt.created_at).add(9, "hour");
        const today = dayjs().add(9, "hour")

        if (today.isSame(created_at, "day")) {
          return true;
        }
      }
      return false;
    });

    if (todays.length == 0) {
      console.log("no twt today");
      return;
    }

    const promises = todays.map(fileappend);

    await Promise.all(promises);

    const status = await git.cwd(__dirname + "/tmp/").status();
    console.log(status.modified);

    await git
      .add(__dirname + "/tmp/")
      .addConfig("user.name", "jiyeonseo")
      .addConfig("user.email", "seojeee@gmail.com")
      .commit("update")
      .push(["-u", "origin", "master"], () => {
        core.info("push done");
      })
      .catch((err) => console.log("err::", err));
  } catch (error) {
    // core.setFailed(error.message);
  }
}

run();
