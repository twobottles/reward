import { Injectable } from '@angular/core';
import MetaMaskOnboarding from '@metamask/onboarding';
import Web3 from 'web3';
import { environment as env } from 'src/environments/environment';
//import { abi } from '../../assets/json/abi.js';
import Onboard from 'bnc-onboard';
@Injectable({ providedIn: 'root' })
export abstract class MetamaskBase {
  isLoading: boolean = false;
  loadingMessage: string = '';

  isConnected: boolean = false;
  ethObj: any = window['ethereum' as any];
  selectedAddress: string = '';
  hodlToken: number = 0;
  async connect() {
    const BLOCKNATIVE_KEY = env.blockNativeKey;

    const NETWORK_ID = 56;
    let web3;

    const wallets = [
      { walletName: 'metamask', preferred: true },
      { walletName: 'trust', preferred: true },
    ];

    const onboard = Onboard({
      dappId: BLOCKNATIVE_KEY,
      networkId: NETWORK_ID,
      subscriptions: {
        wallet: (wallet) => {
          // instantiate web3 when the user has selected a wallet
          web3 = new Web3(wallet.provider);
        },
      },
      walletSelect: {
        wallets: wallets,
      },
      darkMode: true,
    });

    await onboard.walletSelect();

    // Run wallet checks to make sure that user is ready to transact

    await onboard.walletCheck();

    this.ethObj
      .request({ method: 'eth_requestAccounts' })
      .then((accounts: any) => {
        if (accounts) {
          if (accounts.length > 0) {
            this.isConnected = true;
            window.location.reload();
          }
        }
      })
      .catch((err: any) => {
        if (err.code === 4001) {
          this.isLoading = false;
        } else {
          console.error(err);

          //this.openResultModal({ isSuccess: false, error: err.message + ". Reloading page..." })

          setTimeout(() => {
            if (err.code == -32002) {
              window.location.reload();
            }
          }, 2000);
        }

        this.isLoading = false;
      });
  }

  openModal(message: any) {
    this.loadingMessage = message;
    this.isLoading = true;
  }
  closeModal() {
    this.isLoading = false;
  }
}
