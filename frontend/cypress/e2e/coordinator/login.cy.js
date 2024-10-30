/// <reference types='Cypress' />

describe('Coordinator Dashboard Test', () => {

  // 测试账号： coortest01@gmail.com 密码123

  beforeEach(() => {
    cy.visit('/'); 
    // login
    cy.get('[data-cy=loginBtn]').click();
    cy.get('#email').type('coortest01@gmail.com');
    cy.get('#password').type('123');
    cy.get('.ant-form-item-control-input-content > .ant-btn').click();
  });

  it('Check route after login as Coordinator and check dashboard component', () => {
    cy.url().should('include', '/coordinator/dashboard');

    // header
    cy.get('.header-logo > img').should('be.visible');
    cy.get('.header-unsw-logo > img').should('be.visible');
    cy.get('[style="font-size: 24px; font-weight: bold;"]').should('contain.text', 'Coordinator Dashboard');

    // sider menu
    cy.get('.ant-menu-item').eq(0).should('contain.text', 'Dashboard');
    cy.get('.ant-menu-item').eq(1).should('contain.text', 'Team List');
    cy.get('.ant-menu-item').eq(2).should('contain.text', 'ApprovePending');
    cy.get('.ant-menu-item').eq(3).should('contain.text', 'Project List');
    cy.get('.ant-menu-item').eq(4).should('contain.text', 'Supervised Project');
    cy.get('.ant-menu-item').eq(5).should('contain.text', 'Created Project');

    // content Cards
    cy.get(':nth-child(1) > .ant-card > .ant-card-body').should('be.visible');
    cy.get(':nth-child(2) > .ant-card > .ant-card-body').should('be.visible');
    cy.get(':nth-child(3) > .ant-card > .ant-card-body').should('be.visible');
    cy.get(':nth-child(4) > .ant-card > .ant-card-body').should('be.visible');
    cy.get(':nth-child(5) > .ant-card > .ant-card-body').should('be.visible');
  })

  it('Check Pending Tutor Functionality', () => {
    // 测试包含的tutor 账号, wait for approve 状态
    // tutorTestDelete@gmail.com 123
    // tutorTestApprove@gmail.com 123
    cy.get('.ant-menu-item').eq(2).click();
    cy.wait(500);

    // search test
    cy.get('.ant-table-filter-column > .ant-dropdown-trigger').click();
    cy.get('.ant-input').type('Delete');
    cy.get('[style="padding: 8px;"] > .ant-space > :nth-child(1) > .ant-btn').click();
    cy.get('.ant-table-row > :nth-child(1)').should('contain.text', 'Delete');

    // delete test
    cy.get(':nth-child(3) > .ant-space > :nth-child(2) > .ant-btn');
    cy.get(':nth-child(3) > .ant-space > :nth-child(2) > .ant-btn').click();

    // Approve test
    cy.get('.ant-table-filter-column > .ant-dropdown-trigger').click();
    cy.get('.ant-input').clear().type('Approve');
    cy.get('[style="padding: 8px;"] > .ant-space > :nth-child(1) > .ant-btn').click();
    cy.get('.ant-table-row > :nth-child(1)').should('contain.text', 'Approve');
    cy.get(':nth-child(3) > .ant-space > :nth-child(1) > .ant-btn');
    cy.get(':nth-child(3) > .ant-space > :nth-child(1) > .ant-btn').click();

  })

  it('Check Created Project Functionality', () => {
    cy.get('.ant-menu-item').eq(5).click();

    // Create a Proj
    cy.get('.ant-layout-sider-children > .ant-btn').click();
    cy.get('.ant-modal-content').should('be.visible');
    cy.get(':nth-child(1) > .ant-row > .ant-form-item-control > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-input')
      .type('Test Create Project');
    cy.get(':nth-child(3) > .ant-row > .ant-form-item-control > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-input')
      .type('5');
    cy.get(':nth-child(4) > .ant-row > .ant-form-item-control > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-input')
      .type('test');
    cy.get(':nth-child(5) > .ant-row > .ant-form-item-control > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-input')
      .type('test');
    cy.get(':nth-child(6) > .ant-row > .ant-form-item-control > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-input')
      .type('test');
    cy.get(':nth-child(7) > .ant-row > .ant-form-item-control > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-input')
      .type('test');
    cy.get(':nth-child(8) > .ant-row > .ant-form-item-control > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-input')
      .type('test');
    cy.get('.ant-modal-footer > .ant-btn-primary').click();
    cy.get('.ant-notification-notice-message').should('contain.text', 'Project created successfully');
  })

  it('Check Edit Project Functionality', () => {
    cy.get('.ant-menu-item').eq(5).click();
    cy.get('.ant-card-body .ant-menu-item').eq(0).click();
    cy.get('[style="margin-top: 20px;"] > .ant-btn').click();
    cy.get('.ant-modal-content').should('be.visible');
    cy.get('.ant-select-selector').type('test tag');
    cy.contains('Edit Project').click();
    cy.get('.ant-modal-footer > .ant-btn-primary').click();
    cy.get('.ant-notification-notice-message').should('contain.text', 'Project updated successfully');

  })


  it('Check Project List: Assign Supervisor', () => {

    // 需要一个已被admin审批的project: Supervisor Assign Test
    cy.get('.ant-menu-item').eq(3).click();
    cy.get('.ant-table-column-has-sorters > .ant-table-filter-column > .ant-dropdown-trigger').click();
    cy.get('.ant-input').type('Test Create Project');
    cy.get('[style="padding: 8px;"] > .ant-space > :nth-child(1) > .ant-btn').click();
    cy.get('[data-row-key="66ae18d783971f8333328e12"] > :nth-child(3) > .ant-space > :nth-child(2) > .ant-btn').click();
    cy.get('.ant-select-selector').click();
    cy.contains('Coor Test01').click();
    cy.get('.ant-modal-footer > .ant-btn-primary').click();
    cy.get('.ant-notification-notice-message').should('contain.text', 'Supervisor assigned successfully!');
  })

  it('Check Supervised Project', () => {
    cy.get('.ant-menu-item').eq(4).click();
    cy.get('.ant-card-body .ant-menu-item').eq(0).click();
    cy.get('[style="margin-top: 20px;"] > .ant-btn').click();
    cy.get('.ant-modal-content').should('be.visible');
    cy.get('.ant-select-selector').type('test tag');
    cy.contains('Edit Tags').click();
    cy.get('.ant-modal-footer > .ant-btn-primary').click();
    cy.get('.ant-notification-notice-message').should('contain.text', 'Tags updated successfully');

  })
})