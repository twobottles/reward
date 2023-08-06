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
  idleTime: number = 0;
  lastBuyer: string = '';
  lastBuyDate: string = '';
  lastBuyHoursDiff: string = '';
  megaJackpotExecutionTime: string = '';

  constructor(private http: HttpClient) {
    super();
  }

  ngOnInit(): void {
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
                  //  this.selectedAddress = "0x8531E44b4C6feAAEbBf758c70fb16f44442d9ffA";
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
                      console.log(response);
                      this.hodlToken = parseFloat(
                        parseFloat(
                          Web3.utils.fromWei(response, 'ether')
                        ).toFixed(2)
                      );
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
    this.getLastBuyer();
    this.getMegaJackpotExecutionTime();
  }

  getScheduledRewardDate() {
    const web3 = new Web3(this.ethObj);
    var contract = new web3.eth.Contract(abi, env.ca);

    contract.methods
      // @ts-ignore
      .getScheduledReward()
      .call()
      .then(async (response: any) => {
        console.log(response);
        this.scheduledCountDown(1691339916);
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
    const web3 = new Web3(this.ethObj);

    console.log(web3.eth.getBalance(env.ca));
    web3.eth.getBalance(env.ca).then(async (response: any) => {
      const rew = Web3.utils.fromWei(response, 'ether');
      this.totalEthRewards = (parseFloat(rew) / 2).toFixed(2);
    });
  }

  getIdleTime() {
    const web3 = new Web3(this.ethObj);
    var contract = new web3.eth.Contract(abi, env.ca);

    contract.methods
      // @ts-ignore
      .getMegaRewardIdle()
      .call()
      .then(async (response: any) => {
        this.idleTime = 48;
      });
  }

  getLastBuyer() {
    const web3 = new Web3(this.ethObj);
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
    const web3 = new Web3(this.ethObj);
    var contract = new web3.eth.Contract(abi, env.ca);

    contract.methods
      // @ts-ignore
      .getLastBuyTime()
      .call()
      .then(async (response: any) => {
        var d = new Date(0);
        d.setUTCSeconds(1691327532);

        this.lastBuyDate = this.formatDate(d);
      });
  }

  getMegaJackpotExecutionTime() {
    const web3 = new Web3(this.ethObj);
    var contract = new web3.eth.Contract(abi, env.ca);

    contract.methods
      // @ts-ignore
      .getLastBuyTime()
      .call()
      .then(async (response: any) => {
        console.log(response);

        var d = new Date(0);
        d.setUTCSeconds(1691339916);

        this.megaJackpotExecutionTime = this.formatDate(d);
        this.scheduledMegaCountDown(1691339916);
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

  scheduledMegaCountDown(epochDate: any) {
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
}
