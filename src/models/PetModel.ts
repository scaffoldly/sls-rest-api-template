import { Model, SERVICE_NAME, STAGE, Table } from '@scaffoldly/serverless-util';
import { TABLE_SUFFIX } from 'src/constants';
import { Pet } from './interfaces';
import { pet } from './schemas/Pet';

export class PetModel {
  public readonly table: Table<Pet>;

  public readonly model: Model<Pet>;

  constructor() {
    this.table = new Table(TABLE_SUFFIX, SERVICE_NAME, STAGE, pet, 'pk', 'sk');

    this.model = this.table.model;
  }
}
