<template>
  <div class="welcome-page">
    <div class="content">
      <img class="bg-image" src="../../../assets/img/welcome-bg.png">
      <div class="word-info">
        <p class="big">随时随地，条理清晰</p>
        <p class="big">即刻开始享受工作</p>
        <p class="small">你理想的工作方式 —日事清</p>
      </div>
      <div class="footer">
        <div class="operate">
          <button class="btn login-btn" @click="openUrl('login')">登录</button>
          <button class="btn sign-btn" @click="openUrl('sign')">注册</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import electron from 'electron'
const urlPackage  = electron.remote.require('url')
const util = electron.remote.require('./native/util')
const mainBroswerWindow   = electron.remote.BrowserWindow.fromId(1);
const db = mainBroswerWindow.mainDb;
export default {
  name: 'welcome',
  data () {
    return {
    }
  },
  methods:{
    async getUrl () {
      const config = await db.getServerConfig();
      let server;
      if (config.enablePrivate) {
        server = config.privateUrl;
      } else {
        server = config.officelUrl;
      }
      return server;
    },
    async login () {
      const baseUrl = await this.getUrl();
      if (!baseUrl) return;
      return urlPackage.resolve(baseUrl, '/account/login');
    },
    async sign () {
      const baseUrl = await this.getUrl();
      if (!baseUrl) return;
      return urlPackage.resolve(baseUrl, '/account/register');
    },
    async openUrl(type) {
      let url;
      if (type === 'login') {
        url = await this.login();
      } else {
        url = await this.sign();
      }
      if (url) {
        const result = await util.testServer(url);
        if (result.alive) {
          this.$emit('display',false)
          this.$emit('setUrl',url)
        } else {
          util.showNetworkErrorDialog(result.message);
        }
      } else {
        util.showNetworkErrorDialog('自定义服务器不可用');
      }
    }
  }
}
</script>
<style scoped>
.btn {
  background: none;
  border: none;
  outline: none;
  color: #fff;
  width: 160px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  border-radius: 2px;
  padding: 0;
  letter-spacing: 3.15px;
}
.btn.disabled, .btn:disabled {
  cursor: not-allowed;
  background-color: #E0E0E0 !important;
  background-image: none;
}
.welcome-page {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: #3b8bd8;
  z-index: 1;
}
.welcome-page .content {
  position: absolute;
  top: 21.4%;
  right: 11.7%;
  bottom: 7.1%;
  left: 7.7%;
}
.welcome-page .bg-image {
  width: 416px;
  height: 295px;
  position: absolute;
  right: 0;
  top: 0;
}
.welcome-page .word-info {
  position: absolute;
  left: 0;
  top: 50px;
  line-height: 1;
}
.welcome-page .word-info > p {
  color: #fff;
  margin: 0;
}
.welcome-page .word-info .big {
  font-size: 36px;
  letter-spacing: 2.9px;
}
.welcome-page .word-info .small {
  font-size: 16px;
  letter-spacing: 1.43px;
}
.welcome-page .word-info p + p {
  margin-top: 20px;
}
@media (min-width: 1900px) {
  .welcome-page .content {
    top: 19.1%;
    right: 8.1%;
    bottom: 8.5%;
    left: 8.4%;
  }
  .welcome-page .word-info .big {
    font-size: 68px;
    letter-spacing: 5.53px;
  }
  .welcome-page .word-info .small {
    font-size: 28px;
    letter-spacing: 2.5px;
  }
  .welcome-page .bg-image {
    width: 925px;
    height: 610px;
  }
}
@media (min-width: 1600px) and (max-width: 1900px) {
  .welcome-page .content {
    top: 18.9%;
    right: 10.3%;
    bottom: 13%;
    left: 10.8%;
  }
  .welcome-page .word-info .big {
    font-size: 54px;
    letter-spacing: 4.39px;
  }
  .welcome-page .word-info .small {
    font-size: 20px;
    letter-spacing: 1.79px;
  }
  .welcome-page .bg-image {
    width: 717px;
    height: 473px;
  }
}
@media (min-width: 1300px) and (max-width: 1600px) {
  .welcome-page .content {
    top: 21.5%;
    right: 11.9%;
    bottom: 13%;
    left: 7.8%;
  }
  .welcome-page .word-info .big {
    font-size: 48px;
    letter-spacing: 3.9px;
  }
  .welcome-page .word-info .small {
    font-size: 20px;
    letter-spacing: 1.79px;
  }
  .welcome-page .bg-image {
    width: 580px;
    height: 383px;
  }
}
.welcome-page .footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  text-align: center;
  font-size: 0px;
}
.welcome-page .footer .more {
  line-height: 1;
}
.welcome-page .footer .operate {
  margin-bottom: 27px;
}
.welcome-page .footer .setting-btn {
  font-size: 14px;
  color: #FFF;
  letter-spacing: 0;
  cursor: pointer;
}
.welcome-page .footer .login-btn {
  background-color: #81E71C;
}
.welcome-page .footer .sign-btn {
  background-color: #fff;
  color: #55A8FD;
  margin-left: 40px;
}

</style>
