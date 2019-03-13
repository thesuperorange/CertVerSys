const keytool = require("../src/keytool");
import {IssueController} from '../src/certtest/issue.controller';

test("bytes32tostr", () => {
  const test = IssueController.bytes32tostr("6f72616e6765");
  expect(test).toEqual("orange");
});
