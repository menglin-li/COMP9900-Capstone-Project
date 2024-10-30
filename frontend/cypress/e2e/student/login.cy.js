/// <reference types='Cypress' />

function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

let username = `${generateRandomString(4)}@ad.unsw.edu.au`;

describe("Student Profile Tests", () => {
  beforeEach(() => {
    cy.intercept("POST", "/user/login").as("loginRequest");
    let password = "22";
    // Before each test, you can perform actions like visiting a URL
    cy.visit("http://localhost:3000/Home");
    cy.get('[data-cy="loginBtn"] > span').click();
    cy.get('[data-cy="user-email"]').type(username);
    cy.get('[data-cy="user-password"]').type(password); // This should be a custom command you define for logging in
    cy.get(".ant-form-item-control-input-content > .ant-btn > span").click();

    cy.wait("@loginRequest").then((interception) => {
      const responseBody = interception.response.body;
      //需要注册一次账号密码
      if (
        responseBody.error == "Incorrect password" ||
        responseBody.error == "Incorrect email"
      ) {
        cy.get('[data-cy="switchBtn"]').click();
        cy.get('[data-cy="inputEmail"]').type(username);
        cy.get('[data-cy="inputFirstName"]').type("1");
        cy.get('[data-cy="inputLastName"]').type("2");
        cy.get('[data-cy="password"]').type(password);
        cy.get('[data-cy="c_password"]').type(password);
        cy.get('[data-cy="reg"]').click();
      }
    });
  });

  it("Test List", () => {
    cy.get(".ant-menu-item").eq(1).click();
    cy.wait(5 * 1000);

    cy.get('[data-cy="createTeam"]').click();
    cy.get('[data-cy="teamName"]').type("test");
    cy.get(".ant-modal-footer button:nth-child(2)").click();
    cy.wait(5 * 1000);
    cy.get('[data-cy="inviteStudents"]').should("exist").click();
  });

  it("My Team Invite", () => {
    cy.get(".ant-menu-item").eq(2).click();
    cy.wait(5 * 1000);
    cy.get('[data-cy="inviteStudents"]').should("exist");
    cy.get('[data-cy="inviteStudents"]').click();

    cy.get(".ant-select-selector").should("exist");
    cy.get(".ant-select-selector").click();

    cy.get(
      ".rc-virtual-list-holder-inner .ant-select-item:nth-child(1)"
    ).should("exist");
    cy.get(
      ".rc-virtual-list-holder-inner .ant-select-item:nth-child(1)"
    ).click();
    cy.get(".ant-modal-footer > .ant-btn-primary").click();
    cy.wait(5 * 1000);

    // cy.get('[data-node-key="2"]').should("exist");
    // cy.get('[data-node-key="2"]').click();

    // cy.get("#manage_preferences_name").type("test1", { force: true });
    // cy.get("#manage_preferences_members").type("test1\ntest2\ntest3", {
    //   force: true,
    // });
    // cy.get('[data-cy="projectPreference1"]').click();

    // cy.get('[data-cy="managerPreferences"]').click();
    // cy.get('[data-cy="downloadPDF"]').click();
  });
  it("My Team Kick", () => {
    cy.get(".ant-menu-item").eq(2).click();
    cy.get(
      "#rc-tabs-0-panel-1 > div > div:nth-child(1) > div.ant-card-body > div > div:nth-child(2) > div > div > div > button"
    ).should("exist");
    cy.get(
      "#rc-tabs-0-panel-1 > div > div:nth-child(1) > div.ant-card-body > div > div:nth-child(2) > div > div > div > button"
    ).click();

    cy.get(".ant-modal-confirm-btns .ant-btn-primary").should("exist");
    cy.get(".ant-modal-confirm-btns .ant-btn-primary").click();
    cy.wait(5 * 1000);
  });

  it("My Team Leave", () => {
    cy.get(".ant-menu-item").eq(2).click();
    cy.get('[data-cy="leaveTeam"]').should("exist");
    cy.get('[data-cy="leaveTeam"]').click();
    cy.get(".ant-modal-confirm-btns .ant-btn-dangerous").should("exist");
    cy.get(".ant-modal-confirm-btns .ant-btn-dangerous").click();
    cy.wait(5 * 1000);
  });

  it("My Team Join", () => {
    cy.get(".ant-menu-item").eq(1).click();
    cy.wait(6 * 1000);
    cy.get(
      "#root > div > div > div > main > div > div > div > div:nth-child(2) > div > div > div > div > div > div > table > tbody > tr:nth-child(1) > td:nth-child(4) > button"
    ).should("exist");
    cy.get(
      "#root > div > div > div > main > div > div > div > div:nth-child(2) > div > div > div > div > div > div > table > tbody > tr:nth-child(1) > td:nth-child(4) > button"
    ).click();
  });

  it("My Team", () => {
    cy.get(".ant-menu-item").eq(2).click();
    cy.wait(6 * 1000);
    cy.get('[data-cy="managerPreferences"]').click();
    cy.get('[data-cy="downloadPDF"]').click();
  });

//   it("Project", () => {
//     cy.get(".ant-menu-item").eq(3).click();
//     cy.contains("Allocate Test 03").click();
//     cy.wait(500);
//     cy.get(".ant-card-head-title").should("contain.text", "Allocate Test 03");
//     cy.get(":nth-child(1) > strong").should("contain.text", "Tags");
//     cy.get(":nth-child(2) > strong").should("contain.text", "Capacity");
//     cy.get(":nth-child(3) > strong").should("contain.text", "Background");
//     cy.get(":nth-child(4) > strong").should("contain.text", "Requirement");
//     cy.get(":nth-child(5) > strong").should("contain.text", "Scope");
//     cy.get(":nth-child(6) > strong").should(
//       "contain.text",
//       "Required Knowledge and Skills"
//     );
//     cy.get(":nth-child(7) > strong").should(
//       "contain.text",
//       "Expected Outcomes and Deliverables"
//     );
//     cy.get('[style="margin-top: 20px;"] > .ant-btn').click();
//     cy.get(".ant-modal-content").should("be.visible");
//     cy.get(".ant-select-selector").click();
//     cy.get(".ant-select-selector").type("Test Tag");
//     cy.contains("Edit Tags").click();
//     cy.get(".ant-modal-footer > .ant-btn-primary").click();
//     cy.wait(500);

//     cy.get('[style="margin-top: 20px;"] > .ant-btn').click();
//     cy.get(".ant-tag-close-icon").click();
//     cy.get(".ant-modal-content").should("not.contain.text", "Test Tag");
//   });

  it("My Team Leave", () => {
    cy.get(".ant-menu-item").eq(2).click();
    cy.get('[data-cy="leaveTeam"]').should("exist");
    cy.get('[data-cy="leaveTeam"]').click();
    cy.get(".ant-modal-confirm-btns .ant-btn-dangerous").should("exist");
    cy.get(".ant-modal-confirm-btns .ant-btn-dangerous").click();
    cy.wait(5 * 1000);
  });

  it("Project List", () => {
    cy.get(".ant-menu-item").eq(3).click();
    cy.wait(6 * 1000);
    cy.get(
      '[data-row-key="669407d0496e726b77765c55"] > :nth-child(3) > .ant-space > .ant-space-item > .ant-btn'
    ).click();
    cy.get(".ant-modal-content").should("be.visible");
    cy.wait(5 * 1000);
    cy.get('[data-cy="downloadPDF"]').click();
    cy.get(".ant-modal-close").click();
    cy.get(".ant-modal-content").should("not.be.visible");
  });
});
