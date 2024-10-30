/// <reference types='Cypress' />

describe('Home Page test', () => {
  beforeEach(() => {
    // 访问你的应用程序的登录页面
    cy.visit('/'); // 将 '/login' 替换为你要测试的页面 URL
  });

  it('Visits the home page and checks components', () => {
    cy.url().should('include', '/Home');
    cy.get('.ant-carousel').should('be.visible');

    cy.get('img[alt="logo"]').should('be.visible').and('have.attr', 'src').and('include', 'CPMP4');
    cy.get('h1').should('contain.text', 'Capstone Projects Management Platform');
    
    // Login Modal
    cy.get('[data-cy=loginBtn]').should('contain.text', 'Go to Login');
    cy.get('[data-cy=loginBtn]').click()
    cy.get('.ant-modal').should('be.visible');
    cy.get('img[alt="logo"]').should('be.visible').and('have.attr', 'src').and('include', 'png');
    cy.get('h2').should('contain.text', 'Login');
    cy.get('.ant-btn').should('contain.text', 'Log in');
    cy.get('.ant-btn').should('contain.text', 'Create Account')
    cy.get('.login-modal [data-cy=switchBtn]').click();
    cy.get('.ant-modal').should('be.visible');
    cy.get('h2').should('contain.text', 'User Registration');
    cy.get('.signup-modal .ant-modal-close').click();

    // Sign up Modal
    cy.get('[data-cy=SignUpBtn]').should('contain.text', 'Go to Signup');
    cy.get('[data-cy=SignUpBtn]').click();
    cy.get('h2').contains('User Registration').should('be.visible');
    cy.get('.ant-form-item-control-input #email').should('be.visible');
    cy.get('.ant-form-item-control-input #firstName').should('be.visible');
    cy.get('.ant-form-item-control-input #lastName').should('be.visible');
    cy.get('.ant-form-item-control-input #password').should('be.visible');
    cy.get('.ant-form-item-control-input #c_password').should('be.visible');
    cy.get('.ant-radio-group').should('be.visible');
    cy.get('.ant-btn-primary').contains('Sign Up').should('be.visible');

    cy.get('.signup-modal [data-cy=switchBtn]').click();
    cy.get('.ant-modal').should('be.visible');
    cy.get('.login-modal .ant-modal-close').click();
  });

  // Login functionality
  it('Check Login funcitonality when wrong email and wrong password', () => {
    cy.get('[data-cy=loginBtn]').click();
    cy.get('#email').type('test@example.com');
    cy.get('#email').should('have.value', 'test@example.com');
    cy.get('#password').type('testpassword');
    cy.get('#password').should('have.value', 'testpassword');
    cy.get('.ant-form-item-control-input-content > .ant-btn').click();
    cy.contains('Login failed. Please check your credentials.').should('be.visible');
    cy.contains('Incorrect email').should('be.visible');
  })

  it('Check Login funcitonality when correct email and wrong password', () => {
    cy.get('[data-cy=loginBtn]').click();
    cy.get('#email').type('studentlcc10@ad.unsw.edu.au');
    cy.get('#email').should('have.value', 'studentlcc10@ad.unsw.edu.au');
    cy.get('#password').type('testpassword');
    cy.get('#password').should('have.value', 'testpassword');
    cy.get('.ant-form-item-control-input-content > .ant-btn').click();
    cy.contains('Login failed. Please check your credentials.').should('be.visible');
    cy.contains('Incorrect password').should('be.visible');
  })

  // it('Check Forgot Password funcitonality', () => {
  //   cy.get('[data-cy=loginBtn]').click();
  //   cy.contains('Forgot Password?').click();
  //   cy.url().should('include', 'https://iam.unsw.edu.au/home');
  // })

  // Sign up functionality

  // student
  it('Check Signup funcitonality for student with wrong Email format', () => {
    cy.get('[data-cy=SignUpBtn]').click();
    cy.get('#email').type('student@gmail.com');
    cy.get('#firstName').type('test');
    cy.get('#lastName').type('student');
    cy.get('[data-cy=password]').type('123');
    cy.get('[data-cy=c_password]').type('123');
    cy.get('.ant-form-item-control-input-content > .ant-btn').click();
    cy.contains('Students must use a UNSW email address as username!').should('be.visible');
  })

  it('Check Signup funcitonality for student with different password and confirm password', () => {
    cy.get('[data-cy=SignUpBtn]').click();
    cy.get('#email').type('TestStudent@ad.unsw.edu.au');
    cy.get('#firstName').type('test');
    cy.get('#lastName').type('student');
    cy.get('[data-cy=password]').type('123');
    cy.get('[data-cy=c_password]').type('321');
    cy.get('.ant-form-item-control-input-content > .ant-btn').click();
    cy.contains('The two passwords are different!').should('be.visible');
  })

  // other role
  it('Check Signup funcitonality for tutor with wrong Email format', () => {
    cy.get('[data-cy=SignUpBtn]').click();
    cy.get('#email').type('tutorTest');
    cy.get('#firstName').type('test');
    cy.get('#lastName').type('tutor');
    cy.get('#role_type > :nth-child(2) > :nth-child(2)').click();
    cy.get('[data-cy=password]').type('123');
    cy.get('[data-cy=c_password]').type('123');
    cy.get('.ant-form-item-control-input-content > .ant-btn').click();
    cy.contains('Invalid email format!').should('be.visible');
  })

  it('Check Signup funcitonality for client with wrong Email format', () => {
    cy.get('[data-cy=SignUpBtn]').click();
    cy.get('#email').type('clientTest');
    cy.get('#firstName').type('test');
    cy.get('#lastName').type('client');
    cy.get(':nth-child(3) > :nth-child(2)').click();
    cy.get('[data-cy=password]').type('123');
    cy.get('[data-cy=c_password]').type('123');
    cy.get('.ant-form-item-control-input-content > .ant-btn').click();
    cy.contains('Invalid email format!').should('be.visible');
  })

  it('Check Signup funcitonality for coordinator with wrong Email format', () => {
    cy.get('[data-cy=SignUpBtn]').click();
    cy.get('#email').type('coordinatorTest');
    cy.get('#firstName').type('test');
    cy.get('#lastName').type('coordinator');
    cy.get(':nth-child(4) > :nth-child(2)').click();
    cy.get('[data-cy=password]').type('123');
    cy.get('[data-cy=c_password]').type('123');
    cy.get('.ant-form-item-control-input-content > .ant-btn').click();
    cy.contains('Invalid email format!').should('be.visible');
  })
})

