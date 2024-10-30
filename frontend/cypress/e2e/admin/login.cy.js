// cypress/integration/user_profile_spec.js
/// <reference types='Cypress' />

describe('Admin Profile Tests', () => {
    beforeEach(() => {
      // Before each test, you can perform actions like visiting a URL
      cy.visit('http://localhost:3000/Home');
      cy.get('[data-cy="loginBtn"] > span').click()
      cy.get('[data-cy="user-email"]').type('admin');
      cy.get('[data-cy="user-password"]').type('123'); // This should be a custom command you define for logging in
      cy.get('.ant-form-item-control-input-content > .ant-btn > span').click() 
    });
  
    it('should be able to edit profile', () => {
      
      cy.get('.user-profile-container > .ant-dropdown-trigger').click()
      cy.get('[data-cy="edit"]').click()
      cy.get('#resume').clear().type('I am an Admin'); // 确保你在表单输入框中清除旧数据并输入新数据

      // 提交更新
      cy.get('.ant-modal-footer > .ant-btn-primary').click(); // 确保你点击的是正确的保存按钮
  
      // 验证更新成功的反馈
      cy.contains('Profile updated successfully').should('be.visible'); // 根据实际情况调整
      // 重新打开用户个人资料下拉菜单
      cy.get('.user-profile-container > .ant-dropdown-trigger').click()
      cy.get('[data-cy="edit"]').click(); // 确保选择器与实际的下拉菜单匹配

    // 验证用户资料是否更新
      cy.get('#resume').should('contain.text', 'I am an Admin');
     }) // 确保选择器匹配显示用户简历信息的元素

    it('should be able to manage and view projects', () => {
      
      cy.get(':nth-child(5) > .ant-card > .ant-card-body').click()
      cy.get('[data-row-key="669407d0496e726b77765c55"] > :nth-child(3) > .ant-space > .ant-space-item > .ant-btn > span').click()
      cy.get('.ant-modal-content').should('be.visible');
      cy.get('.ant-modal-close-x').click();
      cy.get('[data-cy="manage"] > .ant-menu-title-content').should('be.visible');
      cy.get('[data-cy="manage"] > .ant-menu-title-content').click();
      cy.contains('Pending Projects for Approval').should('be.visible');
    })

    it("manage user by filter", () => {
      cy.get('[data-cy="manageUser"] > .ant-menu-title-content').click()
      cy.get(':nth-child(1) > .ant-table-filter-column > .ant-dropdown-trigger').click();
      cy.get('.ant-input').type('aa');
      cy.get('.ant-btn > :nth-child(2)').click();
      cy.contains('aa').should('be.visible');
      cy.contains('User Name').should('be.visible');
      cy.get(':nth-child(2) > .ant-table-filter-column > .ant-dropdown-trigger').click();
      // cy.get('[data-menu-id="rc-menu-uuid-34638-3-client"] > .ant-dropdown-menu-title-content').find('#ant-checkbox ant-wave-target css-dev-only-do-not-override-1uq9j6g').click()
      cy.get('.ant-dropdown-menu')
      .contains('Tutor')
      .parent()
      .find('input[type="checkbox"]')
      .check();
      cy.get('.ant-table-filter-dropdown-btns > .ant-btn-primary > span').click();
      cy.get('.ant-table-row').each(($row) => {
        cy.wrap($row)
          .find('td') 
          .eq(1) 
          .should('contain.text', 'tutor');
      })
      
      // approve user
      // cy.get('[data-row-key="66991c6cd33375f067be4228"] > :nth-child(3) > .ant-space > :nth-child(1) > .ant-btn > span').click()
      // search by name

      //qing kong sou suo
      // cy.get(':nth-child(1) > .ant-table-filter-column > .ant-dropdown-trigger').click();
      // cy.get('[style="padding: 8px;"] > .ant-space > :nth-child(2) > .ant-btn').click();
      // cy.get('.ant-btn > :nth-child(2)').click();
      // cy.get(':nth-child(2) > .ant-table-filter-column > .ant-dropdown-trigger').click();
      // cy.get('[data-menu-id="rc-menu-uuid-14640-3-tutor"] > .ant-dropdown-menu-title-content').click();
     });
    // it.only('it should approve a project', () => {
    it ('view the report', () => {
      cy.get(':nth-child(6) > .ant-card > .ant-card-body').click();
      cy.get('.ant-layout-content').scrollTo('bottom', { duration: 3000 });
      cy.get('.ant-layout-content').scrollTo('top', { duration: 3000 });
      cy.get(':nth-child(5) > canvas').should('exist').and('be.visible');
    })

    it ('should be able to logout', () => {
      cy.get('.user-profile-container > .ant-dropdown-trigger').click();
      cy.get('.ant-dropdown-menu-item').eq(2).click();
    })
    // })
  });
  