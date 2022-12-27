# dataPublisherについて

dataPublisherは、以下の動作をします。
- 各時間レンジごとのチャートデータをデータプールサーバーから各フロントエンドへ配信
- ユーザーによって要求されるブロックナンバーの詳細情報のリクエスト・レスポンスをデータプールサーバーとの間で中継
- ユーザーが'Block list'ページで要求するページに含まれるブロックデータのリクエスト・レスポンスをデータプールサーバーとの間で中継

なお、dataPublisherは全ての通信で[sokcet.io](https://socket.io/)を使用しています。  

# 事前準備
事前に以下のことを完了して下さい。
- [blockDataRecorder](https://github.com/ethereumNetStats/blockDataRecorder)のDockerのインストール〜ソースコードの実行
- [minutelyBasicNetStatsRecorder](https://github.com/ethereumNetStats/minutelyBasicNetStatsRecorder)の実行
- [hourlyBasicNetStatsRecorder](https://github.com/ethereumNetStats/hourlyBasicNetStatsRecorder)の実行
- [dailyBasicNetStatsRecorder](https://github.com/ethereumNetStats/dailyBasicNetStatsRecorder)の実行
- [weeklyBasicNetStatsRecorder](https://github.com/ethereumNetStats/weeklyBasicNetStatsRecorder)の実行
- [socketServer](https://github.com/ethereumNetStats/socketServer)の実行
- [dataPoolServer](https://github.com/ethereumNetStats/dataPoolServer)の実行

# ソースコード
ソースコードを確認したい場合は、以下のソースコードを確認して下さい。
- メイン：

# 使い方
以下では、ubuntu server v22.04での使用例を説明します。  
まずこのレポジトリを`clone`します。
```shell
git clone https://github.com/ethereumNetStats/dataPublisher.git
```
`clone`が終わったら以下のコマンドでクローンしたディレクトリに移動して下さい。
```shell
cd ./dataPublisher
```
このリポジトリでは固有ドメインを使用しているのでドメインとSSL証明書の取得をして下さい（詳細の説明は省略します）。  
ドメインの取得は、例えば[Amazon Route 53](https://aws.amazon.com/jp/route53/)などを利用して取得して下さい。  
SSL証明書は、[certbot](https://certbot.eff.org/)を使用して取得して下さい。  
ドメイン及びSSL証明書の取得が終わったらクローンしたディレクトリ内にある`.envSample`に各SSL証明書ファイルのインストール先のパスを記入して下さい。
```shell
DATAPOOL_SERVER_LAN_ADDRESS=ws://127.0.0.1:2226

SSL_CERTIFICATION_PRIVKEY=/etc/letsencrypt/live/********.***/privkey.pem
SSL_CERTIFICATION_CERT=/etc/letsencrypt/live/********.***/cert.pem
SSL_CERTIFICATION_CHAIN=/etc/letsencrypt/live/********.***/chain.pem
```
パスの編集が終わったら`.envSample`を`.env`にリネームして下さい。
```shell
mv ./.envSample ./.env
```
次に[Node.js](https://nodejs.org/ja/)のインストールをします。
以下のコマンドを実行して下さい。なお、以下の手順は最も簡単なインストール方法です。必要に応じて`nvm`などのバージョンマネージャーを使用してインストールしても構いません。
```shell
sudo apt update
sudo apt install nodejs
```
次にパッケージマネージャー(`npm`)をインストールします。
```shell
sudo apt install npm
```
`npm`をインストールしたら以下のコマンドでパッケージをインストールします。
```shell
npm install
```
次にdataPoolServerをデーモン化して永続的に実行するために`forever`をインストールします。
```shell
npm install -g forever
```
`forever`のインストールが終了したら次のコマンドでTypescriptソースをコンパイルします。
```shell
tsc --project tsconfig.json
```
コンパイルが終了したら`forever`で`dataPublisher.js`を起動します。
```shell
forever start dataPublisher.js
```
