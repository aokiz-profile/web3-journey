'use client';

import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function ConnectWallet() {
  const t = useTranslations('certificate');
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, chains } = useSwitchChain();
  const [showConnectors, setShowConnectors] = useState(false);
  const [showChainSwitch, setShowChainSwitch] = useState(false);

  const currentChain = chains.find(c => c.id === chainId);

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        {/* Chain Selector */}
        <div className="relative">
          <button
            onClick={() => setShowChainSwitch(!showChainSwitch)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm"
          >
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>{currentChain?.name || 'Unknown'}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showChainSwitch && (
            <div className="absolute top-full right-0 mt-2 py-2 bg-card border border-border rounded-lg shadow-xl z-50 min-w-[180px]">
              {chains.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => {
                    switchChain({ chainId: chain.id });
                    setShowChainSwitch(false);
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary/50 transition-colors ${
                    chain.id === chainId ? 'text-primary' : ''
                  }`}
                >
                  {chain.id === chainId && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  <span className={chain.id !== chainId ? 'ml-6' : ''}>{chain.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Address & Disconnect */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20">
          <span className="text-sm font-mono">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          <button
            onClick={() => disconnect()}
            className="p-1 hover:bg-red-500/20 rounded transition-colors"
            title={t('disconnect')}
          >
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowConnectors(!showConnectors)}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-bg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isPending ? (
          <>
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {t('connecting')}
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {t('connectWallet')}
          </>
        )}
      </button>

      {showConnectors && !isPending && (
        <div className="absolute top-full right-0 mt-2 py-2 bg-card border border-border rounded-lg shadow-xl z-50 min-w-[200px]">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => {
                connect({ connector });
                setShowConnectors(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-secondary/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                {connector.name === 'MetaMask' ? (
                  <span className="text-xl">🦊</span>
                ) : connector.name === 'WalletConnect' ? (
                  <span className="text-xl">🔗</span>
                ) : (
                  <span className="text-xl">👛</span>
                )}
              </div>
              <span>{connector.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
