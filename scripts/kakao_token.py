#!/usr/bin/env python3
"""카카오 리프레시 토큰 발급 도우미 (내 컴퓨터에서 한 번 실행).

준비 (https://developers.kakao.com):
  1. 내 애플리케이션 > 애플리케이션 추가
  2. 카카오 로그인 > 활성화 ON, [앱] > [플랫폼 키] > [REST API 키] > 리다이렉트 URI 에 https://localhost 등록
  3. 카카오 로그인 > 동의항목 > '카카오톡 메시지 전송(talk_message)' 사용 설정
     친구에게도 보내려면 '카카오 서비스 내 친구목록(friends)'도 사용 설정하고,
     받을 친구를 [앱] > [멤버(팀원)]로 초대한다. 친구도 아래 '수신자 동의 URL'로 한 번 동의해야 한다.
     (검수받지 않은 앱은 팀원끼리만 친구 메시지를 주고받을 수 있다)
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
    with_friends = input("친구에게도 보낼까요? (y/N): ").strip().lower() == "y"
    scope = "talk_message,friends" if with_friends else "talk_message"
    auth_url = "https://kauth.kakao.com/oauth/authorize?" + urllib.parse.urlencode(
        {"client_id": key, "redirect_uri": REDIRECT_URI, "response_type": "code", "scope": scope}
    )
    if with_friends:
        print("\n[수신자 동의 URL] 받을 친구에게 이 주소를 보내 카카오 계정으로 한 번 동의하게 하세요.")
        print("동의 후 '사이트에 연결할 수 없음'이 떠도 정상입니다. 친구가 동의를 마친 뒤 아래 단계를 진행하세요.")
        print(auth_url + "\n")
        input("친구가 동의했으면 엔터: ")
    print("\n아래 주소를 브라우저에서 열고 (본인 계정으로) 동의하세요:\n" + auth_url + "\n")
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

    if with_friends:
        req = urllib.request.Request(
            "https://kapi.kakao.com/v1/api/talk/friends?limit=100",
            headers={"Authorization": "Bearer " + tok["access_token"]},
        )
        try:
            with urllib.request.urlopen(req, timeout=15) as res:
                friends = json.loads(res.read().decode()).get("elements", [])
        except urllib.error.HTTPError as e:
            raise SystemExit(f"친구 목록 조회 실패 HTTP {e.code}: {e.read().decode(errors='replace')}")
        if not friends:
            print("\n메시지를 보낼 수 있는 친구가 없어요. 친구가 팀원으로 등록됐고 동의를 마쳤는지 확인하세요.")
        else:
            print("\n보낼 수 있는 친구 (받을 사람의 uuid를 쉼표로 이어서 등록, 최대 5명):")
            for f in friends:
                print(f"  {f.get('profile_nickname', '(이름 없음)')}: {f['uuid']}")
            print("KAKAO_FRIEND_UUIDS=<위 uuid>")
            print("친구에게만 보내고 나에게는 안 보내려면 KAKAO_SEND_TO_ME=0 도 추가")


if __name__ == "__main__":
    main()
