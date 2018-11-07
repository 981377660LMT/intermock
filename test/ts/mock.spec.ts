/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import 'mocha';

import {expect} from 'chai';
import * as _ from 'lodash';

import {Intermock} from '../../src/lang/ts/intermock';
import {MapLike} from '../../src/lib/types';

import {expectedAny} from './test-data/any';
import {expectedArray1} from './test-data/array';
import {expectedEnum} from './test-data/enum';
import {expectedFlat} from './test-data/flat';
import {FunctionInterface} from './test-data/functions';
import {expectedMockType} from './test-data/mockType';
import {expectedNested} from './test-data/nestedSingle';
import {expectedOptional1, expectedOptional2} from './test-data/optional';
import {expectedSpecificInterface} from './test-data/specificInterfaces';
import {expectedTypeAlias} from './test-data/typeAlias';

interface Options {
  files?: string[];
  isFixedMode?: boolean;
  isOptionalAlwaysEnabled?: boolean;
  interfaces?: string[];
  useJson?: boolean;
}

function runTestCase(
    file: string, outputProp: string, expected: unknown, options?: Options) {
  const imOptions = _.assign({}, {files: [file], isFixedMode: true}, options);
  const im = new Intermock(imOptions);

  return im.generate().then((output: MapLike<{}>) => {
    if (outputProp) {
      expect(_.get(output, outputProp)).to.deep.equal(expected);
    } else {
      expect(output).to.deep.equal(expected);
    }
  });
}

function getOutput(file: string, options?: Options): Promise<MapLike<{}>> {
  const imOptions = _.assign({}, {files: [file], isFixedMode: true}, options);
  const im = new Intermock(imOptions);

  return im.generate();
}

describe('Intermock TypeScript: Mock tests', () => {
  it('should generate mock for a flat interface, with just primitives', () => {
    return runTestCase(
        `${__dirname}/test-data/flat.ts`, 'FlatInterface', expectedFlat);
  });

  it('should generate mock for a specified mock type', () => {
    return runTestCase(
        `${__dirname}/test-data/mockType.ts`, 'FlatPerson', expectedMockType);
  });

  it('should generate mock for singly nested interfaces', () => {
    return runTestCase(
        `${__dirname}/test-data/nestedSingle.ts`, 'Person', expectedNested);
  });

  it('should generate mock for interfaces with optional types - optional forced as always',
     () => {
       return runTestCase(
           `${__dirname}/test-data/optional.ts`, 'User',
           expectedOptional1.User);
     });

  it('should generate mock for interfaces with optional types - optional forced as never',
     () => {
       return runTestCase(
           `${__dirname}/test-data/optional.ts`, 'User', expectedOptional2.User,
           {isOptionalAlwaysEnabled: true});
     });

  it('should generate mock for type aliases - as a property', () => {
    return runTestCase(
        `${__dirname}/test-data/typeAlias.ts`, 'Person',
        expectedTypeAlias.Person);
  });

  it('should generate mock for type aliases - as a definition', () => {
    return runTestCase(
        `${__dirname}/test-data/typeAlias.ts`, 'Detail',
        expectedTypeAlias.Detail);
  });

  it('should generate mock for enums', () => {
    return runTestCase(
        `${__dirname}/test-data/enum.ts`, 'Person', expectedEnum.Person);
  });

  it('should generate mock for basic arrays', () => {
    return runTestCase(
        `${__dirname}/test-data/array.ts`, 'User', expectedArray1.User);
  });

  it('should generate mock for specific interfaces', () => {
    return runTestCase(
        `${__dirname}/test-data/specificInterfaces.ts`, '',
        expectedSpecificInterface, {interfaces: ['Person', 'User']});
  });

  it('should generate mock for any types', () => {
    return runTestCase(`${__dirname}/test-data/any.ts`, 'User', expectedAny);
  });

  it('should generate mock for interfaces with functions', async () => {
    const output = await getOutput(`${__dirname}/test-data/functions.ts`);
    const basicRet =
        (output.FunctionInterface as FunctionInterface).basicFunctionRetNum();
    const interfaceRet =
        (output.FunctionInterface as FunctionInterface).functionRetInterface();

    expect(basicRet).to.eql(86924);
    expect(interfaceRet).to.eql({
      name:
          'Animi repellat eveniet eveniet dolores quo ullam rerum reiciendis ipsam. Corrupti voluptatem ipsa illum veritatis eligendi sit autem ut quia. Ea sint voluptas impedit ducimus dolores possimus.',
      email: 'Myron_Olson39@hotmail.com'
    });
  });

  it('should generate JSON', () => {});
});