import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionsService } from './subscriptions.service';

@Injectable()
export class SubscriptionsScheduler {
  private readonly logger = new Logger(SubscriptionsScheduler.name);

  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  /**
   * Chaque jour à 07h00 (Europe/Luxembourg) :
   * génère automatiquement les factures brouillon pour toutes
   * les souscriptions actives dont la nextBillingDate est atteinte.
   */
  @Cron('0 7 * * *', { timeZone: 'Europe/Luxembourg' })
  async handleDailyGeneration() {
    this.logger.log('Génération automatique des factures souscriptions...');
    try {
      const result = await this.subscriptionsService.generateDueInvoices();
      if (result.generated > 0) {
        this.logger.log(`${result.generated} facture(s) brouillon générée(s).`);
      } else {
        this.logger.debug('Aucune facture à générer aujourd\'hui.');
      }
    } catch (err) {
      this.logger.error('Erreur lors de la génération automatique', err);
    }
  }
}
