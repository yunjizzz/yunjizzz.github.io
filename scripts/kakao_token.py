#!/usr/bin/env python3
"""카카오 리프레시 토큰 발급 도우미 (내 컴퓨터에서 한 번 실행).

준비 (https://developers.kakao.com):
  1. 내 애플리케이션 > 애플리케이션 추가
  2. 카카오 로그인 > 활성화 ON, Redirect URI 에 https://localhost 등록
  3. 카카오 로그인 > 동의항목 > '카카오톡 메시지 전송(talk_message)' 사용 설정
  4. 앱 키 > REST API 키 복사

실행:
  python3 scripts/kakao_token.py
  -> 출력된 URL을 브라우저로 열고 동의 -> https://localhost/?code=XXXX 로 이동하면
     주소창의 code 값을 붙여 넣는다. 발급된 리프레시 토큰을 클라우드 환경변수에 등록한다.
"""
import getpass
import json
import urllib.error
import urllib.parse
import urllib.request

REDIRECT_URI = "https://localhost"


def main():
    key = input("REST API 키: ").strip()
    secret = getpass.getpass("Client Secret (안 켰으면 엔터): ").strip()
    auth_url = "https://kauth.kakao.com/oauth/authorize?" + urllib.parse.urlencode(
        {"client_id": key, "redirect_uri": REDIRECT_URI, "response_type": "code", "scope": "talk_message"}
    )
    print("\n아래 주소를 브라우저에서 열고 동의하세요:\n" + auth_url + "\n")
    code = input("이동한 주소의 code 값 (또는 주소 전체): ").strip()
    if "code=" in code:
        code = urllib.parse.parse_qs(urllib.parse.urlparse(code).query)["code"][0]

    data = {"grant_type": "authorization_code", "client_id": key, "redirect_uri": REDIRECT_URI, "code": code}
    if secret:
        data["client_secret"] = secret
    req = urllib.request.Request(
        "https://kauth.kakao.com/oauth/token", data=urllib.parse.urlencode(data).encode(), method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            tok = json.loads(res.read().decode())
    except urllib.error.HTTPError as e:
        raise SystemExit(f"발급 실패 HTTP {e.code}: {e.read().decode(errors='replace')}")

    days = tok.get("refresh_token_expires_in", 0) // 86400
    print("\n발급 완료. 클라우드 환경변수에 아래 값을 등록하세요 (유효기간 약 %d일):" % days)
    print("KAKAO_REST_API_KEY=" + key)
    print("KAKAO_REFRESH_TOKEN=" + tok["refresh_token"])
    if secret:
        print("KAKAO_CLIENT_SECRET=<입력한 Client Secret>")


if __name__ == "__main__":
    main()
