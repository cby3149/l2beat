import { expect } from 'chai'
import { getEtherPrice } from '../../../src/core/prices/getEtherPrice'
import { ExchangePriceRecord } from '../../../src/peripherals/database/ExchangePriceRepository'

describe('getEtherPrice', () => {
  describe('single record', () => {
    const expectedPrice = 4_000n * 10n ** 18n
    const testCases: ExchangePriceRecord[] = [
      {
        blockNumber: 123n,
        assetId: 'dai-stablecoin',
        exchange: 'uniswap-v1',
        liquidity: 400_000n * 10n ** 18n,
        price: 10n ** 18n / 4_000n,
      },
      {
        blockNumber: 123n,
        assetId: 'usd-coin',
        exchange: 'uniswap-v1',
        liquidity: 400_000n * 10n ** 6n,
        price: 10n ** 30n / 4_000n,
      },
      {
        blockNumber: 123n,
        assetId: 'tether-usd',
        exchange: 'uniswap-v1',
        liquidity: 400_000n * 10n ** 6n,
        price: 10n ** 30n / 4_000n,
      },
      {
        blockNumber: 123n,
        assetId: 'wrapped-ether',
        exchange: 'uniswap-v2-dai',
        liquidity: 100n * 10n ** 18n,
        price: 4_000n * 10n ** 18n,
      },
      {
        blockNumber: 123n,
        assetId: 'wrapped-ether',
        exchange: 'uniswap-v3-usdc-3000',
        liquidity: 100n * 10n ** 18n,
        price: 4_000n * 10n ** 6n,
      },
      {
        blockNumber: 123n,
        assetId: 'wrapped-ether',
        exchange: 'uniswap-v2-usdt',
        liquidity: 100n * 10n ** 18n,
        price: 4_000n * 10n ** 6n,
      },
    ]

    for (const record of testCases) {
      it(`${record.exchange} - ${record.assetId}`, () => {
        const price = getEtherPrice([record])
        expect(price).to.equal(expectedPrice)
      })
    }
  })

  describe('multiple records', () => {
    it('selects the best uniswap 2 & 3 record', () => {
      const price = getEtherPrice([
        {
          blockNumber: 123n,
          assetId: 'wrapped-ether',
          exchange: 'uniswap-v2-dai',
          liquidity: 100n * 10n ** 18n,
          price: 4_001n * 10n ** 18n,
        },
        {
          blockNumber: 123n,
          assetId: 'wrapped-ether',
          exchange: 'uniswap-v3-usdc-3000',
          liquidity: 300n * 10n ** 18n,
          price: 4_002n * 10n ** 6n,
        },
        {
          blockNumber: 123n,
          assetId: 'wrapped-ether',
          exchange: 'uniswap-v2-usdt',
          liquidity: 200n * 10n ** 18n,
          price: 4_003n * 10n ** 6n,
        },
      ])
      expect(price).to.equal(4_002n * 10n ** 18n)
    })
  })
})
