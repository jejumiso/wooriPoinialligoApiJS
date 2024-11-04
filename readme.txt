빌드시 node버전 14로 꼭 바꿔주기

git rm -r --cached node_modules
git commit -m "Remove node_modules from repository"
git push cafe24 master

카페24 빌드할때
핫스팟키고 하기 핸드폰의 와이파이도 꺼져있어야함..
브랜치카 마스터야함..그래서 main지움


카페24 게시에 시간이 많이 소요돔.
1. 인증키?? 그걸 카페24의 앱에 등록해야함.. 
인증키 만드는건 어렵지 않음
인증키를 만들면 내컴퓨터가 알아서 그 인증키를 가리키고 있고
push할때 비번 누르라고 함..
인증키를 잃어버려도 문제는 없을듯함.. 그래도 기억하기 위해
네이버 내게 쓴편지함에 보관.

2. 1.의 인증키로 push할수 있음.

3. push는 반듯이 master여야 함..

4. web.js가 루트에 있어야함.

5. ts개발시 ts는 web.js가 루트가 아니라 경로가 흐트러짐..
해결이 불가능한건 아니지만..ts를 카페24에 게시하지는 않을듯함..

6. 노드 14버전이어야함..

7. 알리고 api는 한번 등록하면 수정할일은 없기에
카페24를 이용하겠지만 다른 프로젝트는 카페24에 게시 하지 않을 드함.

8. 그래도 알리고 api를 쓰기에는 좋을듯.
저려함고
고정ip이고
api수정할일은 별로 없기에..(보안상 키수정정도...)








https 에 관하여
1. 카페24 nodejs호스팅은 https제공이 안됨

방안 a. aws등을 이용을 생각해봤지만
대부분 어차피 유료이고 무료라 하더라도 고정ip가 안됨.
유료이면서 고정ip가 있을 수 있지만 굳이 유료라면
단순한 api를 옮기면서까지 할 필요는 없을드

결정 : 카페24의 nodejs호스팅을 그대로 이용하고
저렴한 도메인을 구매하고(wooripointkakaoallimapi.store)
Cloudflare 를 통해 wooripointkakaoallimapi.store를 https서비슷 받는다
wooripointkakaoallimapi.store의 네임서버를 cloudflare로 바꾸고고
cloudflare 에서 카페24를 가리키게 하면 되는것 같다.