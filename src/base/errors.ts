import { BadRequestException } from '@roxavn/core/base';
import { baseModule } from './module.js';

export class NotLinkedAddressException extends BadRequestException {
  i18n = {
    default: {
      key: 'Error.NotLinkedAddressException',
      ns: baseModule.escapedName,
    },
  };
}
export class LinkedAddressException extends BadRequestException {
  i18n = {
    default: {
      key: 'Error.LinkedAddressException',
      ns: baseModule.escapedName,
    },
  };
}
