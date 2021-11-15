import { ExchangePriceRecord } from '../../peripherals/database/ExchangePriceRepository'

export function getEtherPrice(exchangePrices: ExchangePriceRecord[]) {
  const [record] = exchangePrices
  if (record.exchange === 'uniswap-v1') {
    if (record.assetId === 'dai-stablecoin') {
      return 10n ** (18n * 3n - 18n) / record.price
    } else if (
      record.assetId === 'usd-coin' ||
      record.assetId === 'tether-usd'
    ) {
      return 10n ** (18n * 3n - 6n) / record.price
    }
  } else {
    const [, , asset] = record.exchange.split('-')
    if (asset === 'dai') {
      return record.price
    } else if (
      asset === 'usdc' ||
      asset === 'usdt'
    ) {
      return record.price * 10n ** (18n - 6n)
    }
  }
}
