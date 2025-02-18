/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {directoryIndexPlugin} from '@bendera/wds-plugin-directory-index';

export default {
  appIndex: './index.html',
  nodeResolve: true,
  open: true,
  preserveSymlinks: true,
  plugins: [
    directoryIndexPlugin(),
  ],
};
