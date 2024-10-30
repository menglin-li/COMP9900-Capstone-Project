/// <reference types='Cypress' />

describe('Client Profile Tests', () => {
    beforeEach(() => {
      // Before each test, you can perform actions like visiting a URL
      cy.visit('http://localhost:3000/Home');
      cy.get('[data-cy="loginBtn"] > span').click()
      cy.get('[data-cy="user-email"]').type('clientzhou@ad.unsw.edu.au');
      cy.get('[data-cy="user-password"]').type('123'); // This should be a custom command you define for logging in
      cy.get('.ant-form-item-control-input-content > .ant-btn > span').click() 
    });
    it ('should be able to check team detail', () => {
        cy.get('.ant-menu-item').eq(1).click();
        cy.get('[data-row-key="66a6648e59c71d0bcaf5d8b5"] > .ant-table-row-expand-icon-cell > .ant-table-row-expand-icon').click();
        cy.get('.ant-table-expanded-row > .ant-table-cell').should('exist')
    })


    it ('should check project lists', () => {
        cy.get('.ant-menu-item').eq(2).click();
        cy.get('table') // 选择表格
        .find('tr') // 选择所有行
        .eq(1) // 选择第一行（注意：索引从0开始，所以第一行是.eq(0)，第二行是.eq(1)）
        .find('td') // 选择该行中的所有单元格
        .eq(2) // 选择第三列（同样，索引从0开始，所以第三列是.eq(2)）
        .click(); // 点击该单元格
        cy.get('.ant-modal') 
        .should('be.visible');
    })
    it ('filter functionality', () => {
        cy.get('.ant-menu-item').eq(2).click();
        cy.get('.ant-table-column-has-sorters > .ant-table-filter-column > .ant-dropdown-trigger').click()
        cy.get('.ant-input').type('project');
        cy.get('.ant-btn > :nth-child(2)').click();
        cy.contains('project').should('be.visible');
        cy.get(':nth-child(2) > .ant-table-filter-column > .ant-dropdown-trigger').click();
      // cy.get('[data-menu-id="rc-menu-uuid-34638-3-client"] > .ant-dropdown-menu-title-content').find('#ant-checkbox ant-wave-target css-dev-only-do-not-override-1uq9j6g').click()
       cy.get('.ant-dropdown-menu')
        .contains('Web Application Development')
        .parent()
        .find('input[type="radio"]')
        .check();
        cy.get('.ant-table-filter-dropdown-btns > .ant-btn-primary > span').click();
        cy.get('.ant-table-row').each(($row) => {
            cy.wrap($row)
              .find('td') 
              .eq(1) 
              .should('contain.text', 'Web Application Development');
        })
    })

    it ('should edit My created project', () => {
        cy.get('.ant-menu-item').eq(3).click();
        cy.get('.ant-layout-sider-children > .ant-btn > span').click();
        cy.get('.ant-modal') 
        .should('be.visible');
        cy.get('input[name="title"]').type('My Project Title');
        cy.get('input[name="capacity"]').type('50');
    
        // 选择标签
        cy.get('input').eq(2).type('3')
    
        // 填写文本区域
        cy.get('textarea[name="background"]').type('This is the project background.');
        cy.get('textarea[name="requirements"]').type('These are the project requirements.');
        cy.get('textarea[name="scope"]').type('This is the project scope.');
        cy.get('textarea[name="requiredKnowledgeAndSkills"]').type('These are the required knowledge and skills.');
        cy.get('textarea[name="expectedOutcomesDeliverables"]').type('These are the expected outcomes and deliverables.');
    
        // 提交表单
        // cy.get('.ant-modal-footer > .ant-btn-primary').click();
        // cy.get('.ant-notification-notice')
        // .should('be.visible')
        // .and('contain', 'Project created successfully');
    })

    it ('should see all project that you created and manage', () => {
        cy.get('.ant-menu-item').eq(3).click();
        cy.get('.ant-card-body > .ant-layout-has-sider > .ant-layout-sider > .ant-layout-sider-children > .ant-menu > .ant-menu-item > .ant-menu-title-content')
        .click()
        cy.get('.ant-tabs-tab').should('be.visible');
        cy.get('[style="margin-top: 20px;"] > .ant-btn')
        .should('be.visible');

        // 点击 edit button
        cy.get('[style="margin-top: 20px;"] > .ant-btn').click();
        cy.get('input[name="title"]').clear().type('Update Project Title');
        cy.get('.ant-modal-footer > .ant-btn-primary').click();
        cy.get('.ant-notification-notice')
        .should('be.visible')
        .and('contain', 'Project updated successfully');
    })

    it ('should be able to logout', () => {
        cy.get('.user-profile-container > .ant-dropdown-trigger').click();
        cy.get('.ant-dropdown-menu-item').eq(2).click();
    })
})