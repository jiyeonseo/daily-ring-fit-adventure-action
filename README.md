# daily-ring-fit-adventure-action

## Demo
- https://github.com/jiyeonseo/ring-fit-adventure-exercise-log

## Usage 

트위터 타임라인으로 공유된 링핏 어드벤쳐 운동 기록 이미지를 가져와 네이버 OCR API로 결과 데이터 가져오기. 

Collecting Ring Fit Adventure Exercise logs from Twitter and Extracting the data with Naver OCR API. 

```
name: "ringfit-batch"
on:
  schedule:
    - cron: '0 14 * * *' # UTC (한국시간 +9 해주어야 합니다)

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: ./
      with:
        naver_ocr_url: ${{ secrets.NAVER_OCR_URL }}
        naver_secret_key: ${{ secrets.NAVER_OCR_SECRET }}
        twt_id: "seojeee"
        twt_consumer_key: ${{ secrets.TWT_CONSUMER_KEY }}
        twt_consumer_secret: ${{ secrets.TWT_CONSUMER_SECRET }}
        github_access_token : ${{ secrets.GH_ACCESS_TOKEN }}
```

## Inputs 
- `naver_ocr_url` : 네이버 OCR 콘솔에서 제공하는 url ([링크](https://www.ncloud.com/product/aiService/ocr))
- `naver_secret_key` : 네이버 OCR 콘솔에서 제공하는 secret key ([링크](https://www.ncloud.com/product/aiService/ocr))

- `twt_id` : 운동 결과 이미지를 올릴 트위터 아이디 
- `twt_consumer_key` : 트위터 API 사용을 위한 consumer key ([링크](https://developer.twitter.com/en/portal/dashboard))
- `twt_consumer_secret` : 트위터 API 사용을 위한 consumer secret ([링크](https://developer.twitter.com/en/portal/dashboard))

- `github_access_token` : 깃헙 clone, push를 하기 위한 access token ([링크](https://github.com/settings/tokens))


## Install (local)

Install the dependencies
```
npm install 
```

Run prepare
```
npm run prepare 
```

`/dist/` folder have to be added for the GitHub Actions 
```
git add dist
```

