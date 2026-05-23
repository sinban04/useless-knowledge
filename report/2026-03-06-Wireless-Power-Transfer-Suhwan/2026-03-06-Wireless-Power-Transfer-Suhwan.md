# 1. Remind

## 1.1 페러데이 법칙
   - [나무위키 참고](https://namu.wiki/w/%EC%A0%84%EC%9E%90%EA%B8%B0%20%EC%9C%A0%EB%8F%84)
   ![전자기 유도 이미지](https://i.namu.wiki/i/jb5FyvXxO8LunO5pmPoImWUPLsw6r2JkXQ0KdrjoWD-7sp8bm3zn2ymJ8eBtf-78A5tH7yvQZ9Wi54R1t8uaebfR_JHhDO6v2bu1D7bjk1f-OdKq8FDU8o-1Kci5AkJlGqVafX4A7a5cjH7pDGEkiw.webp)
 - 어떤 폐회로에서 코일을 통과하는 자속의 변화량은 유도 기전력과 같다.
 - 이 때 흐르는 전류를 와전류(eddy current)라고 한다.


## 1.2 앙페르 법칙
![앙페르법칙](https://mblogthumb-phinf.pstatic.net/MjAyMjA1MDdfMjAy/MDAxNjUxOTI4NTU3MTI5.pNjss1WpAv0vfGefCx-bto8oMf4SjCnlWjA0rYuBvhUg.kHa3VZSCq15dl167Fr784sFsNu3yeEgzHrmSh0PD3Okg.PNG.lagrange0115/407px-Manoderecha.svg.png?type=w800)

- 전류가 흐르면 (또는 전기장이 형성되면) 그 주변으로 자기장이 형성된다.

## 1.3 맥스웰 방정식

$$ \begin{aligned} \nabla \cdot \mathbf{E} &= \frac{\rho}{\varepsilon_0} && \text{(가우스 법칙)} \\ \nabla \cdot \mathbf{B} &= 0 && \text{(가우스 자기 법칙)} \\ \nabla \times \mathbf{E} &= -\frac{\partial \mathbf{B}}{\partial t} && \text{(패러데이 법칙)} \\ \nabla \times \mathbf{B} &= \mu_0 \mathbf{J} + \mu_0 \varepsilon_0 \frac{\partial \mathbf{E}}{\partial t} && \text{(앙페르-맥스웰 법칙)} \end{aligned} $$
- 가우스 법칙 : 전하 = 전기장이다. 
  -> 전하가 있는 곳에 전기장이 형성됨
  -> (식의 의미) 전기장의 크기는 전하량에 비례한다.
- 가우스 자기 법칙 : 자기장의 홀극은 없다. 
- 페러데이 법칙 : 시간에 따른 자기장의 변화는 전기장을 만들어낸다.
  ->$(\nabla \times)$ 가 있으므로, 자속 방향을 축으로 회전하는 방향으로 전기장이 생성됨
- 앙페르-맥스웰 법칙 : 전류가 흐르거나$(J)$ 전기장이 변하면 $(\frac{\partial \mathbf{E}}{\partial t})$ 자기장이 생긴다 $(B)$ 
  -> 마찬가지로 $(\nabla \times)$ 가 있으므로 전기장을 축으로 회전하는 방향

# 2. 자속을 이용한 전력전송
## 2.1 자석을 이용
- 코일을 만들고 자석을 계속해서 움직여줄 수 있다면 교류전류를 발생시킬 수 있다. 
- 아래 그림의 G에 full-bridge 회로를 연결하면 직류로 사용이 가능
![전자기 유도 이미지](https://i.namu.wiki/i/jb5FyvXxO8LunO5pmPoImWUPLsw6r2JkXQ0KdrjoWD-7sp8bm3zn2ymJ8eBtf-78A5tH7yvQZ9Wi54R1t8uaebfR_JHhDO6v2bu1D7bjk1f-OdKq8FDU8o-1Kci5AkJlGqVafX4A7a5cjH7pDGEkiw.webp)
![](https://techweb.rohm.co.kr/upload/2016/03/tw_0315_01.png)

## 2.2 앙페르 법칙 + 페러데이 법칙

- 한 쪽 회로에서는 앙페르의 법칙으로 자속을 계속해서 변화시키고, 다른 한 쪽 회로에서는 페러데이 법칙으로 자속의 변화가 전류의 흐름을 만들어 낸다면, ***두 회로가 떨어져 있어도 에너지를 전달할 수 있다.***

![](https://files.resources.altium.com/sites/default/files/octopart/contentful/mosfet-driver-3.png)
- 그래서 보통은 아래와 같은 모습
![](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTg0xbokUO-zmTuEDsaKHwVrt8P_IB9Ui7n9A&**s)
- 송신측은 Full-bridge 회로, 수신측은 AC to DC Converter를 설계한다.
- 실제 제품은 아래처럼 생김
![|300](https://www.devicemart.co.kr/data/goods/1/2019/10/12242276_tmp_dc0ce2a501634d253e7bb944334ac1c44111large.jpg)

## 2.3 무선전력전송 회로 제어

### 2.3.1 PWM 제어
- 결국 자속을 이용한 무선충전은 송신 측의 FullBridge를 제어하는 것이다. 
  1) 위 그림에서 MOSFET의 Gate에 PWM을 연결하여 ON/OFF를 반복
  2) 송신 코일에 교류가 형성
  3) 자속이 계속 변함
  4) 수신 코일에 교류가 형성
  5) AC to DC Converter를 거쳐서 Device로 전력을 전송

### 2.3.2 통신 제어
- 안전한 전력전송을 위해 표준절차가 있음.
- 송신단과 수신단 사이에 통신을 구현, 표준 절차에 따라 표준 절차가 완료되면 전력전송을 시작

# 3. 공진을 이용한 전력전송

## 3.1 공진
- 주파수가 맞는 두 물체가 있을 때, 한 쪽이 그 주파수로 진동하면 다른 한 쪽 물체도 따라서 진동하는 현상
![](https://wiki.homerecz.com/lib/exe/fetch.php/acoustics/sound/sound_behavior/20240216-053700.png)

## 3.2 자기공진
- 한쪽에서 자기장을 공진시키면, 다른 한 쪽도 반응하여 자기장이 공진되는 현상
- 자속을 이용한 무선충전과 동일한 회로를 가지고 있다. 
- 그 원리에서 차이점이 있는데, 한 쪽에서 전자기파를 생성하면 거기에 맞춰 상대 회로도 진동하며 자기장을 형성
- 때문에 송신단에서 반드시 특정 주파수로 진동할 필요가 있음
- 진동을 만들어내는 원리와 진동으로부터 생성된 전기장을 활용하는 방법은 같음
- 특징이라면 코일을 겹치지 않고, 근처에 두어도 충전이 되는 특징이 있음

# 4. Microwave를 이용한 전력전송
## 4.1 무선통신에 대한 고찰
- 우리는 무선통신을 어떻게 하는가?
- 어떤 원리이든, OSI 7계층을 따르는 수밖에 없는데, Pysical Layer의 역할은 송신측의 신호를 수신측이 구별할 수 있게 하는 것이다. 
- 무선전력전송의 관점에서 보면, 송신측의 제어로 수신측의 전력을 높힐 수 있다고 할 수 있다.
- 이것을 고주파수와 전력제어를 통해 고도화 하는 것이 Microwave의 원리
- 가장 기본적인 원리는 앙페르 법칙과 페럳데이 법칙에 기반한다.
- 이 원리대로라면 ***이론상***, 인공위성에서 땅으로 전파를 보내서 충전도 가능
![](https://mblogthumb-phinf.pstatic.net/MjAyMTAyMDNfOTUg/MDAxNjEyMzQ0MTI1NzU0.-FobEI0JY7KIUxyVRzHVFeJ9BE2vhLFr4K9UPA4ELrIg.U0r8Ktqs6o5lYhAbeDUCF71ZUQ63rkJRaQnHQvVxSf4g.PNG.itmass/SE-d9d863b2-ab29-482f-af8d-0143fe2754f7.png?type=w800)

## 4.2 빔포밍
- 전파를 크게 하나로 보내는 것이 아니라 작은 전파를 여러 개를 보내서 전파 사이의 위상차이를 이용하여 핀포인트에 효율적으로 충전을 하는 방법
![](https://mblogthumb-phinf.pstatic.net/MjAyMzAzMTFfMTU5/MDAxNjc4NTQyMTkyMzU1.k8YKTuGz4zwt-WBYMJWkHlwBrfYpLjgHZy-nXFUkBeAg.QpLM7jAanjqV_pJ9qCDtH4OjMbBE1AXtMOTI1Gokbzcg.PNG.wjw1225/image.png?type=w800)

# 5. 3가지 방식 비교
- 자기유도방식, 자기공진방식, 마이프로파 방식 이렇게 3가지가 주요 카테고리이며 보통은 아래 표처럼 비교하여 설명한다.
![](https://image.edaily.co.kr/images/photo/files/NP/S/2020/07/PS20070100140.jpg)

## 5.1 실제
- 실제로는 거의 자기유도방식을 사용한다. 
- 자기 공진은 먼 거리도 90%, 40%로 충전한다고는 하지만 되는 것을 본 적이 없음. -> 주로 자기유도 방식과 함께 사용하여 그 효율을 높히는 데 사용하는데, 자기 유도에 의한 전력전송까지 합쳐서 계산하는 것 같다. (사기)
- 마이크로웨이브 방식은 10%가 중요한 것이 아니다. 아직은 LED 몇 개 켜는 수준이 전부임. 정말정말 특수한 조건에서 10%가 나오는 모양인데, 실제로 본 것은 1%정도 뿐이다.

# 6. 표준화 근황과 통신에 대해

## 6.1 WPC Qi 표준에 대해
- 유럽쪽에서 만든 표준이기 때문에 굉장히 엄격하다
- 개인적인 생각으로는 발전과정이 크게 4단계로 분류할 수 있다고 생각한다.
### 6.1.1 1단계 - 5W (전동칫솔 수준)
- 기본적으로 85kHz 대역을 사용한다.
- 가장 먼저 무선충전이 활용됐던 곳은 전동칫솔이라고 한다.
- 5W로 전력을 제한하고 이에 따른 설계규격이 존재한다.
- 통신은 in-band 통신으로, 전력전송을 하는 코일을 이용해 ASK와 FSK 방식으로 통신했다. (10% 이내의 미세한 진폭 및 주파수 변화를 이용함)

### 6.1.2 2단계 - 5W (초기 휴대폰 충전)
- 통신이 out-band로 바꼈다. 블루투스를 이용한 통신으로 표준절차가 진행된다.

### 6.1.3 3단계 - 15W (중기 휴대폰 충전)
- 5W로 무슨 충전을 하냐며 반발이 심했다. 15W는 위험하다며 느릿느릿한 몇 년간의 표준화 절차를 통해 15W 표준이 나왔으나 하나도 위험하지 않았음.

### 6.1.4 4단계 - 15W MPP 추가
- 표준에서는 코일주변으로 자석을 두는 것을 엄격하게 규제해왔다. : 자석을 근처에 두면 인증을 해주지 않았음
- 여기에 애플은 표준따위는 무시하고 독자적으로 자석을 달아서 사용했다. 특허권 소송때문인지 주파수도 300KHz대 주파수를 사용했다. 
- 결국에는 WPC Qi 2.0 ~ 3.0 과도기에 MPP 표준을 추가하여 애플의 사용방식을 표준으로 인정한다.

## 6.2 WPC Ki에 대해
- WPC Ki는 Qi의 표준화로 큰 성공을 본 WPC가 야심차게 준비한 표준이다.
- 주로 주방을 타겟으로, 표준을 내놓고 있다. 
- 요점은 4가지가 있다. 
- 가장 주력으로 개발하고 있는 표준이지만 너무 느리다
### 6.2.1 인덕션과 공용사용
- 무선충전의 원리는 인덕션의 원리와 동일하다. 수신측에서 저항성을 높혀 발열을 시키는 것이 인덕션의 원리이다. 
- 이 인덕션과 무선전력전송 회로를 결합한 것이다. 
- 때문에 필립스가 선두주자로 생각된다.
### 6.2.2 사용 주파수
- 사용 주파수를 30KHz로 분리했다.

### 6.2.3 전력 대폭 상승
- 전력을 2.4kW (송신단 기준)로 대폭 늘렸다. 

### 6.2.4 통신
- 높은 전력을 사용하는 만큼 통신절차를 완전히 새로 고쳐썼다.
- 짧고 빠르고 전자기 유도현상을 활용하는 NFC를 통신 매개체로 채택했다. 

## 6.3 WPC LEV에 대해
- 자전거나 킥보드같은 Light EV를 타겟으로 개발하는 표준이다.
- 전기자전거나 킥보드가 많이 보급된 현재 상황에서도 white paper만 내놓고 일을 안한다.

## 6.4 자동차 무선충전 표준에 대해

### 6.4.1 DIN 61980
- 독일에서 개발한 DIN 표준이 가장 베이스로 활용된다. 
- 대부분의 표준은 이것을 바탕으로 튜닝한 수준으로 생각할 수 있다.
- 85KHz에 3.3kW를 타겟으로 한다.

### 6.4.2 ISO 19363 / IEC 61980 / ISO 15118
- 가장 유명한 국제 표준화 기구이기 때문에 가장 많이 활용된다.
- ISO 19363은 차량 측 표준, IEC 61980은 충전기 측 표준, ISO 15118은 통신에 대한 표준이다.

### 6.4.3 SAE J2954 / SAE J2847
- 미국 차량 표준화 협회(?)로 힘이 강하다고 한다.
- 전력을 3.3KW에서 11KW까지 3단계 혹은 4단계로 나눠뒀다.
- 대부분 기초적인 내용들은 마찬가지로 DIN 61980 표준을 따른다.

# 7. 리스크에 대해
## 7.1 FOD (MOD)
- Foreign Object Detection (Metal Object Detection)으로 이물질 감지에 대한 내용이다.
- 무선충전은 전선을 직접 만질 일이 없어 안전하다고 광고하고 있지만 다른 문제들이 많다. 
- 그 중 가장 심각한 부분으로, 이물질이 송신코일과 수신코일 사이에 있는 경우다.
- 앞서 말했듯, 인덕션과 원리가 똑같기 때문에 송수신 사이에 금속이물질이 있는 경우 가열되고, 사고로 이어질 수 있다.
- 그렇기 때문에 표준절차에서도 통신과정에서 가장 중요하게 생각하는 것이 이물질이 있는지 여부를 확인하는 것이다.

## 7.2 LOD
- Living Object Detection으로 생명체가 있는지에 대한 내용이다.
- 고출력 전력전송의 경우에는 그만큼 전자파도 강한데, 생물에 영향을 미칠 수 있다고 생각하기 때문에 FOD와 함께 표준에서 가장 중요하게 생각하는 부분이다.
- 송수신단 사이 뿐만 아니라 차량주변, 차량 탑승자까지 영향을 주기 때문에 전자파를 제한하는 방법을 고안하고 있다.
## 7.3 주파수 통제
- 충전이 주파수를 사용하다보니, 국가의 통제를 받는다.
- 이 규제 때문에 개발이 늦어지는 경향도 있다.

## 7.4 통신
- 차량용 전력전송의 경우, 전력이 매우 크기 때문에 통신에 노이즈가 심하다.
- 노이즈에 견고한 구조에 대한 이슈가 있다.

# 8. Appendix

## 8.1 PWM

- clock -> timer count 생성 : clock을 count하여 느린 클럭 모양의 timer count 생성
- timer에 따라 CNT 레지스터 값 증가
- CCR 레지스터에 기준 값 설정
- ARR 레지스터에 기준 값 설정
- PWM지원되는 GPIO에서 PWM 생성

![](data:image/jpeg;base64,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)
