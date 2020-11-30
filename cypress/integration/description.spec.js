describe('The description field', () => {

    it('Focusing on sound elements shows the description', () => {
        cy.visit('/');
        let descrFile, expectedDescr;
        cy.get('#sound-menu .sound').first().focus()
            .then($el => descrFile = $el.get(0).files.description)
            .get('#description').should('not.be.empty')
            .then($el => {
                expectedDescr = $el.get(0).textContent;
                expectedDescr = encodeURI(expectedDescr).split(',')[0];
                expect(expectedDescr).to.not.be.empty;
                cy.request(descrFile).its('body').should('include', expectedDescr);
            })
            .then(() => {
                cy.get('#sound-menu .sound select').first().select('1');
                cy.get('#active-sound-track1-0').focus()
                    .get('#description').contains(decodeURI(expectedDescr));
            });
    });
});
