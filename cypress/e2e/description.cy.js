describe('Sound descriptions', () => {

    it('Display description', () => {
        cy.visit('/');
        cy.get('#sound-menu .sound').first().click();
        cy.get('#description h3').then($el => {
            cy.get('#sound-menu .sound').first()
                .should('have.text',
                        $el.get(0).textContent.charAt(0).toLowerCase()
                        + $el.get(0).textContent.slice(1))
        })
    });

    it('Play a sound', () => {
        cy.visit('/');
        cy.get('#sound-menu .sound').not('.no-audio').first().click().type(' ');
        cy.get('#description .play-icon').should('not.be.visible');
        cy.get('#description .pause-icon').should('be.visible');

        cy.get('#description-play').click();
        cy.get('#description .play-icon').should('be.visible');
        cy.get('#description .pause-icon').should('not.be.visible');

        cy.get('#description-play').click();
        cy.get('#description .play-icon').should('not.be.visible');
        cy.get('#description .pause-icon').should('be.visible');

        cy.get('#sound-menu .sound').not('.no-audio').last().click();
        cy.get('#description .play-icon').should('be.visible');
        cy.get('#description .pause-icon').should('not.be.visible');
    })
});
