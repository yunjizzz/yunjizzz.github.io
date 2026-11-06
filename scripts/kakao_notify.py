#!/usr/bin/env python3
"""카카오톡 '나에게 보내기'로 텍스트 메시지를 보낸다.

사용법:
    python3 scripts/kakao_notify.py "보낼 메시지" [링크URL]

필요한 환경변수 (클라우드 환경 설정에 등록, 저장소에는 절대 넣지 않음):
    KAKAO_REST_API_KEY    카카오 디벨로퍼스 앱의 REST API 키
    KAKAO_REFRESH_TOKEN   scripts/kakao_token.py 로 발급받은 리프레시 토큰
    KAKAO_CLIENT_SECRET   (선택) 앱에서 Client Secret을 켠 경우에만

리프레시 토큰은 약 2개월 동안 유효하다. 만료가 1개월 안쪽으로 남으면 카카오가
새 리프레시 토큰을 내려주는데, 클라우드 실행에서는 이를 저장할 수 없으므로
그 경우 재발급 안내 메시지를 함께 보낸다. 토큰 값 자체는 출력하거나 전송하지 않는다.
"""
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

TOKEN_URL = "https://kauth.kakao.com/oauth/token"
MEMO_URL = "https://kapi.kakao.com/v2/api/talk/memo/default/send"
DEFAULT_LINK = "https://haebom.app/jimin/jobs.html"
MAX_TEXT = 200  # 카카오 텍스트 템플릿 최대 길이


def post(url, data, headers=None):
    body = urllib.parse.urlencode(data).encode()
    req = urllib.request.Request(url, data=body, headers=headers or {}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            return json.loads(res.read().decode())
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors="replace")
        sys.exit(f"[kakao] HTTP {e.code} {url}: {detail}")


def refresh_access_token():
    key = os.environ.get("KAKAO_REST_API_KEY")
    refresh = os.environ.get("KAKAO_REFRESH_TOKEN")
    if not key or not refresh:
        sys.exit("[kakao] KAKAO_REST_API_KEY / KAKAO_REFRESH_TOKEN 환경변수가 없습니다.")
    data = {"grant_type": "refresh_token", "client_id": key, "refresh_token": refresh}
    secret = os.environ.get("KAKAO_CLIENT_SECRET")
    if secret:
        data["client_secret"] = secret
    res = post(TOKEN_URL, data)
    return res["access_token"], "refresh_token" in res


def send(access_token, text, link):
    template = {
        "object_type": "text",
        "text": text[:MAX_TEXT],
        "link": {"web_url": link, "mobile_web_url": link},
        "button_title": "공고 보기",
    }
    res = post(
        MEMO_URL,
        {"template_object": json.dumps(template, ensure_ascii=False)},
        {"Authorization": f"Bearer {access_token}"},
    )
    if res.get("result_code") != 0:
        sys.exit(f"[kakao] 전송 실패: {res}")


def main():
    if len(sys.argv) < 2 or not sys.argv[1].strip():
        sys.exit("사용법: kakao_notify.py \"메시지\" [링크]")
    text = sys.argv[1]
    link = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_LINK

    access_token, rotated = refresh_access_token()
    send(access_token, text, link)
    print("[kakao] 전송 완료")

    if rotated:
        send(
            access_token,
            "[공고 알림] 카카오 리프레시 토큰 만료가 1개월 안쪽으로 남았어요. "
            "scripts/kakao_token.py 로 다시 발급해서 클라우드 환경변수 KAKAO_REFRESH_TOKEN 을 바꿔 주세요.",
            link,
        )
        print("[kakao] 리프레시 토큰 재발급 안내 전송")


if __name__ == "__main__":
    main()
