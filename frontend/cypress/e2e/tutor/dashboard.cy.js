describe('Tutor Dashboard Test', () => {
  beforeEach(() => {
    cy.visit('/'); 
    // login
    cy.get('[data-cy=loginBtn]').click();
    cy.get('#email').type('tutorlcc02@gmail.com');
    cy.get('#password').type('123');
    cy.get('.ant-form-item-control-input-content > .ant-btn').click();
  });

  it('Check route after login as tutor and check dashboard component', () => {
    cy.url().should('include', '/tutor/dashboard');
    cy.get('.ant-menu').should('be.visible');
    cy.get(':nth-child(1) > .ant-card > .ant-card-body').should('be.visible');
    cy.get(':nth-child(2) > .ant-card > .ant-card-body').should('be.visible');
    cy.get(':nth-child(3) > .ant-card > .ant-card-body').should('be.visible');
    cy.get('.header-logo > img').should('be.visible');
    cy.get('.header-unsw-logo > img').should('be.visible');
    cy.get('[style="font-size: 24px; font-weight: bold;"]').should('contain.text', 'Tutor Dashboard');
  })

  it('Check Team List Table Functionality', () => {
    cy.get('.ant-menu-item').eq(1).click();
    cy.get('[data-cy=teamListTable]').should('be.visible');
    // 测试表格下拉栏
    cy.get('[data-row-key="66ac92b2cc4d644e50458531"] > .ant-table-row-expand-icon-cell > .ant-table-row-expand-icon').click();
    cy.get('.ant-space-item > .ant-card > .ant-card-body').should('be.visible');
    cy.get('[data-row-key="66ac92b2cc4d644e50458531"] > .ant-table-row-expand-icon-cell > .ant-table-row-expand-icon').click();
    // 测试sort
    cy.get('.ant-table-column-sorters > .ant-table-column-title').click();
    cy.get('.ant-table-column-sorters > .ant-table-column-title').click();
    cy.get('[data-row-key="66a0a3a65d4575da87dc7831"] > :nth-child(1)').should('contain.text', '时代少年团');
    // 测试search
    cy.get('.ant-table-filter-column > .ant-dropdown-trigger').click();
    cy.get('.ant-input').type('testTeamLML001');
    cy.get('.ant-space > :nth-child(1) > .ant-btn').click();
    cy.get('.ant-table-row > :nth-child(1)').should('contain.text', 'testTeamLML001');
    cy.get('.ant-table-filter-column > .ant-dropdown-trigger').click();
    cy.get('.ant-space > :nth-child(2) > .ant-btn').click();
    cy.get('.ant-space > :nth-child(1) > .ant-btn').click();
    cy.get('[data-row-key="66a0a3a65d4575da87dc7831"] > :nth-child(1)').should('contain.text', '时代少年团');
    cy.get('.ant-table-column-sorters > .ant-table-column-title').click();
  })

  it('Check Invite Modal functionality', () => {
    cy.get('.ant-menu-item').eq(1).click();
    cy.get('[data-row-key="66ac8f2acc4d644e504584b2"] > :nth-child(4) > .ant-btn').click()
    cy.get('.ant-modal-title').should('be.visible').and('contain.text', 'Invite Students to team');
    cy.get('.ant-select').click();
    cy.contains('Student CL13').click();
    cy.get('.ant-select-selection-item').should('contain.text', 'Student CL13');
    cy.get('.ant-select-selection-item-content').should('contain.text', 'Student CL13');
    cy.get('.ant-select-selection-item-remove').click();

    cy.get('.ant-select').click();
    cy.wait(100);
    cy.get('.ant-select').click();
    cy.contains('Menglin').click();

    cy.get('.ant-modal-footer > .ant-btn-primary').click();
    cy.get('.ant-notification-notice-success')
      .should('be.visible')
      .within(() => {
        cy.get('.ant-notification-notice-message').should('have.text', 'Success');
        cy.get('.ant-notification-notice-description').should('have.text', 'All students have been invited');
      });


  })

  it('Check Project List View Modal', () => {
    cy.get('.ant-menu-item').eq(2).click();
    cy.get('[data-row-key="669407d0496e726b77765c55"] > :nth-child(3) > .ant-space > .ant-space-item > .ant-btn').click();
    cy.get('.ant-modal-content').should('be.visible');
    cy.get('.ant-modal-close').click();
    cy.get('.ant-modal-content').should('not.be.visible');
  })

  it('Check Project Table Functionality: Search by proj title', () => {
    cy.get('.ant-menu-item').eq(2).click();
    cy.get('[data-row-key="669407d0496e726b77765c55"] > :nth-child(1)').should('contain.text', 'P2');
    cy.get('.ant-table-column-sorters').click();
    cy.get('.ant-table-column-sorters').click();
    cy.get('[data-row-key="66a21e1fb2adadb1b240b3a0"] > .ant-table-column-sort').should('contain.text', 'P40');
    cy.get('.ant-table-column-sorters').click();
    cy.get('.ant-table-column-sort > .ant-table-filter-column > .ant-dropdown-trigger').click();
    cy.get('.ant-input').type('zhou');
    cy.get('[style="padding: 8px;"] > .ant-space > :nth-child(1) > .ant-btn').click();
    cy.get('[data-row-key="66a21e1fb2adadb1b240b3a0"] > .ant-table-column-sort').should('contain.text', 'zhou');
    cy.get('.ant-table-column-sort > .ant-table-filter-column > .ant-dropdown-trigger').click();
    cy.get('.ant-space > :nth-child(2) > .ant-btn').click();
    cy.get('[data-row-key="669407d0496e726b77765c55"] > .ant-table-column-sort').should('contain.text', 'P2');

  })

  it('Check Project List Table Functionality: Filter by proj tags', () => {
    cy.get('.ant-menu-item').eq(2).click();
    cy.get(':nth-child(2) > .ant-table-filter-column > .ant-dropdown-trigger').click();
    cy.get('.ant-dropdown-menu').contains('2').click();
    cy.get('.ant-table-filter-dropdown-btns > .ant-btn-primary').click();
    cy.get('.ant-table-row > :nth-child(1)').should('contain.text', 'P39');
    cy.get(':nth-child(2) > .ant-table-filter-column > .ant-dropdown-trigger').click();
    cy.get('.ant-btn-link').click();
    cy.get('.ant-table-filter-dropdown-btns > .ant-btn-primary').click();
    cy.get('[data-row-key="669407d0496e726b77765c55"] > :nth-child(1)').should('contain.text', 'P2');
  })

  it('Check My Project Edit Tag Functionality', () => {
    cy.get('.ant-menu-item').eq(3).click();
    cy.contains('Allocate Test 03').click();
    cy.wait(500);
    cy.get('.ant-card-head-title').should('contain.text', 'Allocate Test 03');
    cy.get(':nth-child(1) > strong').should('contain.text', 'Tags');
    cy.get(':nth-child(2) > strong').should('contain.text', 'Capacity');
    cy.get(':nth-child(3) > strong').should('contain.text', 'Background');
    cy.get(':nth-child(4) > strong').should('contain.text', 'Requirement');
    cy.get(':nth-child(5) > strong').should('contain.text', 'Scope');
    cy.get(':nth-child(6) > strong').should('contain.text', 'Required Knowledge and Skills');
    cy.get(':nth-child(7) > strong').should('contain.text', 'Expected Outcomes and Deliverables');
    cy.get('[style="margin-top: 20px;"] > .ant-btn').click();
    cy.get('.ant-modal-content').should('be.visible');
    cy.get('.ant-select-selector').click();
    cy.get('.ant-select-selector').type('Test Tag');
    cy.contains('Edit Tags').click();
    cy.get('.ant-modal-footer > .ant-btn-primary').click();
    cy.wait(500);

    cy.get('[style="margin-top: 20px;"] > .ant-btn').click();
    cy.get('.ant-tag-close-icon').click();
    cy.get('.ant-modal-content').should('not.contain.text', 'Test Tag')

  })

  it('Check My Project Edit Tag Functionality', () => {
    cy.get('.ant-menu-item').eq(3).click();
    cy.contains('Allocate Test 04').click();
    cy.wait(500);
    cy.get('[data-node-key="2"]').click();
    cy.get('[data-row-key="66a694ef59c71d0bcaf5db5d"] > .ant-table-row-expand-icon-cell > .ant-table-row-expand-icon').click();
    cy.contains('Description').should('be.visible');
    cy.get('[data-row-key="66a694ef59c71d0bcaf5db5d"] > .ant-table-selection-column > .ant-checkbox-wrapper').click();
    // submit allocate
    // cy.get('.ant-space > :nth-child(1) > .ant-btn').click();
  })

  it('Check My Project Grade Teams Functionality', () => {
    cy.get('.ant-menu-item').eq(3).click();
    cy.contains('Allocate Test 04').click();
    cy.wait(500);
    cy.get('[data-node-key="3"]').click();
    cy.get(':nth-child(4) > .ant-btn').click();
    cy.get('.ant-modal-content').should('be.visible');
    cy.get('#grade').clear().type('99');
    cy.get('#comment').clear().type('Test Comment');
    cy.get('.ant-form-item-control-input-content > .ant-btn').click();
    cy.get('.ant-message-notice-content').should('contain.text', 'Group updated successfully');  
    cy.get('.ant-table-row > :nth-child(2)').should('contain.text', '99 / 100');
    cy.get('.ant-table-row > :nth-child(3)').should('contain.text', 'Test Comment');
  })
})


// 测试用学生账号，studentlcc11@ad.unsw.edu.au， 123
// 每次测试之后记得退组

