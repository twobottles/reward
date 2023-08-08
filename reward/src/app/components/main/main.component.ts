import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AnimationItem } from 'lottie-web';
import { AnimationOptions } from 'ngx-lottie';
import { environment as env } from '../../../environments/environment';
import { MetamaskBase } from '../metamask';
import Web3 from 'web3';
// @ts-ignore
import { abi } from '../../../assets/json/abi';
import * as fs from 'fs';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent extends MetamaskBase implements OnInit {
  isAudioOn: boolean = false;
  audio: any = new Audio();
  ca: string = '';
  isCountDownEndScheduled: boolean = false;
  totalEthRewards: string = '0';
  totalEthRewardsMega: string = '0';
  idleTime: number = 0;
  lastBuyer: string = '';
  lastBuyDate: string = '';
  lastBuyHoursDiff: string = '';
  megaJackpotExecutionTime: string = '';
  points: number = 0;
  totalPoints: number = 0;

  chanceOfWinning: string = '';
  constructor(private http: HttpClient) {
    super();
  }

  ngOnInit(): void {
    document.addEventListener(
      'scroll',
      (event) => {
        var reveals = document.querySelectorAll('.flipInX');

        for (var i = 0; i < reveals.length; i++) {
          var windowHeight = window.innerHeight;
          var elementTop = reveals[i].getBoundingClientRect().top;
          var elementVisible = 150;

          if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add('active');
          } else {
            reveals[i].classList.remove('active');
          }
        }
      },
      { passive: true }
    );

    document.addEventListener(
      'scroll',
      (event) => {
        var reveals = document.querySelectorAll('.fadeInLeftBig');

        for (var i = 0; i < reveals.length; i++) {
          var windowHeight = window.innerHeight;
          var elementTop = reveals[i].getBoundingClientRect().top;
          var elementVisible = 150;

          if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add('active');
          } else {
            reveals[i].classList.remove('active');
          }
        }
      },
      { passive: true }
    );

    document.addEventListener(
      'scroll',
      (event) => {
        var reveals = document.querySelectorAll('.fadeIn');

        for (var i = 0; i < reveals.length; i++) {
          var windowHeight = window.innerHeight;
          var elementTop = reveals[i].getBoundingClientRect().top;
          var elementVisible = 150;

          if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add('active');
          } else {
            reveals[i].classList.remove('active');
          }
        }
      },
      { passive: true }
    );

    if (env.ca) {
      this.ca = env.ca;
    }

    if (this.ethObj) {
      try {
        this.ethObj.request({ method: 'net_version' }).then((net: any) => {
          if (net != env.net) {
            this.openModal(
              'Incorrect network detected. Please connect to Ethereum network.'
            );
            return;
          }

          this.ethObj
            .request({ method: 'eth_accounts' })
            .then((accounts: any) => {
              if (accounts) {
                if (accounts.length > 0) {
                  this.selectedAddress = accounts[0];

                  this.isConnected = true;

                  const web3 = new Web3(
                    new Web3.providers.HttpProvider(env.rpc)
                  );

                  var contract = new web3.eth.Contract(abi, env.ca);

                  contract.methods
                    // @ts-ignore
                    .balanceOf(this.selectedAddress)
                    .call()
                    .then(async (response: any) => {
                      this.hodlToken = parseFloat(
                        parseFloat(
                          Web3.utils.fromWei(response, 'ether')
                        ).toFixed(2)
                      );

                      this.callUserDetail();
                    });
                } else {
                }
              }

              setTimeout(() => {
                this.isLoading = false;
              }, 2000);
            })
            .catch((err: any) => {
              console.log(err);
              if (err.code === 4001) {
                // EIP-1193 userRejectedRequest error
                // If this happens, the user rejected the connection request.
                console.log('Please connect to MetaMask.');
              } else {
                console.log(err);
              }

              this.isLoading = false;
            });
        });
      } catch (eerr) {}

      this.ethObj.on('accountsChanged', function () {
        window.location.reload();
      });

      this.ethObj.on('networkChanged', function () {
        window.location.reload();
      });
    }
    this.getScheduledRewardDate();

    this.getTotalEthRewards();
    this.getLastBuyer();
    this.getIdleTime();
    this.getLastBuyTime();

    this.getMegaJackpotExecutionTime();
    this.getTotalPointsExt();
  }

  callUserDetail() {
    this.getPoints();
  }

  getScheduledRewardDate() {
    const web3 = new Web3(new Web3.providers.HttpProvider(env.rpc));
    var contract = new web3.eth.Contract(abi, env.ca);

    contract.methods
      // @ts-ignore
      .getScheduledReward()
      .call()
      .then(async (response: any) => {
        console.log(response);
        this.scheduledCountDown(parseFloat(response));
      });
  }

  scheduledCountDown(epochDate: any) {
    var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
    d.setUTCSeconds(epochDate);

    var countDownDate = d.getTime();

    var myfunc = setInterval(() => {
      var now = new Date().getTime();
      var timeleft = countDownDate - now;

      // Calculating the days, hours, minutes and seconds left
      var days = Math.floor(timeleft / (1000 * 60 * 60 * 24));
      var hours = Math.floor(
        (timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      var minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((timeleft % (1000 * 60)) / 1000);

      // Result is output to the specific element
      document.getElementById('days')!.innerHTML = days + 'd ';
      document.getElementById('hours')!.innerHTML = hours + 'h ';
      document.getElementById('mins')!.innerHTML = minutes + 'm ';
      document.getElementById('secs')!.innerHTML = seconds + 's ';

      // Display the message when countdown is over
      if (timeleft < 0) {
        clearInterval(myfunc);
        document.getElementById('days')!.innerHTML = '0d';
        document.getElementById('hours')!.innerHTML = '0h';
        document.getElementById('mins')!.innerHTML = '0m';
        document.getElementById('secs')!.innerHTML = '0s';

        this.isCountDownEndScheduled = true;
      }
    }, 1000);
  }

  getTotalEthRewards() {
    const web3 = new Web3(new Web3.providers.HttpProvider(env.rpc));

    console.log(web3.eth.getBalance(env.ca));
    web3.eth.getBalance(env.ca).then(async (response: any) => {
      const rew = Web3.utils.fromWei(response, 'ether');
      this.totalEthRewards = (parseFloat(rew) / 2).toFixed(2);
      this.totalEthRewardsMega = parseFloat(rew).toFixed(2);
    });
  }

  getIdleTime() {
    const web3 = new Web3(new Web3.providers.HttpProvider(env.rpc));
    var contract = new web3.eth.Contract(abi, env.ca);

    contract.methods
      // @ts-ignore
      .getMegaRewardIdle()
      .call()
      .then(async (response: any) => {
        // var item = new Number(response);
        this.idleTime = parseFloat(response);
      });
  }

  getLastBuyer() {
    const web3 = new Web3(new Web3.providers.HttpProvider(env.rpc));
    var contract = new web3.eth.Contract(abi, env.ca);

    contract.methods
      // @ts-ignore
      .getLastBuyer()
      .call()
      .then(async (response: any) => {
        this.lastBuyer = response;
      });
  }

  getLastBuyTime() {
    const web3 = new Web3(new Web3.providers.HttpProvider(env.rpc));
    var contract = new web3.eth.Contract(abi, env.ca);

    contract.methods
      // @ts-ignore
      .getLastBuyTime()
      .call()
      .then(async (response: any) => {
        var d = new Date(0);
        d.setUTCSeconds(parseFloat(response));

        this.lastBuyDate = this.formatDate(d);

        var lastBuyTime = new Date(0);
        lastBuyTime.setUTCSeconds(parseFloat(response));

        var aimDate = lastBuyTime.setTime(
          lastBuyTime.getTime() + this.idleTime * 60 * 60 * 1000
        );

        this.scheduledMegaCountDown(aimDate);
      });
  }

  getMegaJackpotExecutionTime() {
    const web3 = new Web3(new Web3.providers.HttpProvider(env.rpc));
    var contract = new web3.eth.Contract(abi, env.ca);

    contract.methods
      // @ts-ignore
      .getMegaJackpotExecutionTime()
      .call()
      .then(async (response: any) => {
        console.log(response);

        var d = new Date(0);
        d.setUTCSeconds(parseFloat(response));

        this.megaJackpotExecutionTime = this.formatDate(d);
        //this.scheduledMegaCountDown(parseFloat(response));
      });
  }

  getPoints() {
    const web3 = new Web3(new Web3.providers.HttpProvider(env.rpc));
    var contract = new web3.eth.Contract(abi, env.ca);

    contract.methods
      // @ts-ignore
      .getPoints(this.selectedAddress)
      .call()
      .then(async (response: any) => {
        this.points = parseFloat(response);

        this.chanceOfWinning = ((this.points / this.totalPoints) * 100).toFixed(
          0
        );
      });
  }

  getTotalPointsExt() {
    const web3 = new Web3(new Web3.providers.HttpProvider(env.rpc));
    var contract = new web3.eth.Contract(abi, env.ca);

    contract.methods
      // @ts-ignore
      .getTotalPointsExt()
      .call()
      .then(async (response: any) => {
        this.totalPoints = parseFloat(response);
      });
  }

  getMonth(month: number) {
    switch (month) {
      case 1:
        return 'January';
      case 2:
        return 'February';
      case 3:
        return 'March';
      case 4:
        return 'April';
      case 5:
        return 'May';
      case 6:
        return 'June';
      case 7:
        return 'July';
      case 8:
        return 'August';
      case 9:
        return 'September';
      case 10:
        return 'October';
      case 11:
        return 'November';
      case 12:
        return 'December';
      default:
        return '';
    }
  }

  formatDate(date: any) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm.toUpperCase();
    return `${this.getMonth(
      date.getMonth() + 1
    )} ${date.getDate()},${date.getFullYear()} ${strTime}`;
  }

  scheduledMegaCountDown(epochDateLastBuyTime: any) {
    var countDownDate = epochDateLastBuyTime;
    var myfunc = setInterval(() => {
      var now = new Date().getTime();
      var timeleft = countDownDate - now;

      // Calculating the days, hours, minutes and seconds left
      var days = Math.floor(timeleft / (1000 * 60 * 60 * 24));
      var hours = Math.floor(
        (timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      var minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((timeleft % (1000 * 60)) / 1000);

      // Result is output to the specific element
      document.getElementById('days_mega')!.innerHTML = days + 'd ';
      document.getElementById('hours_mega')!.innerHTML = hours + 'h ';
      document.getElementById('mins_mega')!.innerHTML = minutes + 'm ';
      document.getElementById('secs_mega')!.innerHTML = seconds + 's ';

      // Display the message when countdown is over
      if (timeleft < 0) {
        clearInterval(myfunc);
        document.getElementById('days_mega')!.innerHTML = '0d';
        document.getElementById('hours_mega')!.innerHTML = '0h';
        document.getElementById('mins_mega')!.innerHTML = '0m';
        document.getElementById('secs_mega')!.innerHTML = '0s';
      }
    }, 1000);
  }
  copyCa() {
    navigator.clipboard.writeText(env.ca);
  }
}
