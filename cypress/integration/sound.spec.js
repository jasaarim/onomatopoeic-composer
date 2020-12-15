describe('Sound elements', () => {
    it('Clicking on a sound fetches an audio file', () => {
        cy.visit('/');
        cy.get('#sound-menu .sound').not('.no-audio').first().then($el => {
            expect($el.get(0).audio.preload).to.eq('none');
        });
        let requestedUrl;
        cy.intercept('http://localhost:8000/audio/**', (req) => {
            requestedUrl = decodeURI(req.url);
        }).as('request');
        cy.get('#sound-menu .sound').not('.no-audio').first().click()
            .then($el => {

            })
        cy.wait('@request').then(() => {
            cy.get('#sound-menu .sound').not('.no-audio').first()
                .then($el => {
                    expect($el.get(0).audio.preload).to.eq('auto');
                    expect(requestedUrl).to.include($el.get(0).name);
                });
        });
    });
});
