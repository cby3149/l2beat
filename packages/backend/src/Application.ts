import { ApiServer } from './api/ApiServer'
import { createBlockNumberRouter } from './api/BlockNumberRouter'
import { createHelloRouter } from './api/HelloRouter'
import { createStatusRouter } from './api/StatusRouter'
import { Config } from './config'
import { BlockNumberUpdater } from './core/BlockNumberUpdater'
import { HelloService } from './core/HelloService'
import { SafeBlockService } from './core/SafeBlockService'
import { StatusService } from './core/StatusService'
import { BlockNumberRepository } from './peripherals/database/BlockNumberRepository'
import { DatabaseService } from './peripherals/database/DatabaseService'
import { AlchemyHttpClient } from './peripherals/ethereum/AlchemyHttpClient'
import { EthereumClient } from './peripherals/ethereum/EthereumClient'
import { EtherscanClient } from './peripherals/etherscan'
import { HttpClient } from './peripherals/HttpClient'
import { Logger } from './tools/Logger'

export class Application {
  start: () => Promise<void>

  constructor(config: Config) {
    /* - - - - - TOOLS - - - - - */

    const logger = new Logger(config.logger)

    /* - - - - - PERIPHERALS - - - - - */

    const knex = DatabaseService.createKnexInstance(config.databaseUrl)
    const databaseService = new DatabaseService(knex, logger)
    const blockNumberRepository = new BlockNumberRepository(knex, logger)

    const httpClient = new HttpClient()

    const alchemyHttpClient = new AlchemyHttpClient(
      config.alchemyApiKey,
      httpClient,
      logger
    )
    const ethereumClient = new EthereumClient(alchemyHttpClient)
    const etherscanClient = new EtherscanClient(
      config.etherscanApiKey,
      httpClient,
      logger
    )

    /* - - - - - CORE - - - - - */

    const helloService = new HelloService(config.name)

    const safeBlockService = new SafeBlockService(
      config.core.safeBlockRefreshIntervalMs,
      config.core.safeBlockBlockOffset,
      ethereumClient,
      logger
    )
    const blockNumberUpdater = new BlockNumberUpdater(
      config.core.minBlockTimestamp,
      safeBlockService,
      etherscanClient,
      blockNumberRepository,
      logger
    )

    const statusService = new StatusService({
      alchemyHttpClient,
      blockNumberUpdater,
      databaseService,
      etherscanClient,
      safeBlockService,
    })

    /* - - - - - API - - - - - */

    const apiServer = new ApiServer(config.port, logger, [
      createBlockNumberRouter(blockNumberRepository),
      createHelloRouter(helloService),
      createStatusRouter(statusService),
    ])

    /* - - - - - START - - - - - */

    this.start = async () => {
      logger.for(this).info('Starting')

      await databaseService.migrateToLatest()

      await apiServer.listen()

      await safeBlockService.start()
      await blockNumberUpdater.start()

      logger.for(this).info('Started')
    }
  }
}
