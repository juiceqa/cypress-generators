import mock from "mock-fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "cli-testing-library";
import * as fs from "node:fs";
import { readFileSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("Scaffold - Login Form", () => {
  afterAll(() => {
    mock.restore();
  });

  test("it creates the correct files & contents", async () => {
    const loginFormTemplate = fs.readFileSync(
      resolve(__dirname, "../../src/templates/scaffold/login.js"),
      "utf8"
    );

    const loginCustomCommandTemplate = fs.readFileSync(
      resolve(__dirname, "../../src/templates/commands/login.js"),
      "utf8"
    );

    mock({
      "cypress/integration": {
        "login.js": loginFormTemplate,
      },
      "cypress/support": {
        "commands.js": loginCustomCommandTemplate,
      },
    });

    const { findByText, userEvent } = await render("node", [
      resolve(__dirname, "../../src/cli.js"),
    ]);

    expect(await findByText("What do you want?")).toBeInTheConsole();
    userEvent.keyboard("[Enter]");

    expect(await findByText("Login Form Spec")).toBeInTheConsole();
    userEvent.keyboard("[ArrowDown]");
    userEvent.keyboard("[Enter]");

    expect(
      await findByText("Please enter the file name for the spec.")
    ).toBeInTheConsole();
    userEvent.keyboard("login");
    userEvent.keyboard("[Enter]");

    expect(
      await findByText("Are you writing this spec in JavaScript or TypeScript?")
    ).toBeInTheConsole();
    userEvent.keyboard("[Enter]");

    const specFilePath = `${process.cwd()}/cypress/integration/login.js`;
    const commandFilePath = `${process.cwd()}/cypress/support/commands.js`;
    const specFileContents = readFileSync(specFilePath, "utf8");
    const commandsFileContents = readFileSync(commandFilePath, "utf8");

    expect(specFileContents).toMatch(loginFormTemplate);
    expect(commandsFileContents).toMatch(loginCustomCommandTemplate);
  });
});
