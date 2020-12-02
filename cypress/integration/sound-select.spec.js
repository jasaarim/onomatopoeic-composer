describe('Moving sounds with select', () => {

    it('Creating new active sounds, moving, and removing them', () => {
        cy.visit('/');
        cy.get('#sound-tracks').then($el => $el.get(0).setStart(5));
        cy.get('#sound-menu .sound').not('.no-audio')
            .first().find('select').select('8');
        cy.get('#sound-tracks').then($el => $el.get(0).setStart(2.5));
        cy.get('#sound-tracks').then($el => $el.get(0).setDuration(20));
        cy.get('#sound-menu .sound').not('.no-audio')
            .first().find('select').select('4');

        let width0;
        cy.get('#active-sound-track8-50').then($el => {
            const sound = $el.get(0);
            expect(sound.position).to.eq(50);
            expect(sound.style.left).to.eq('50%');
            width0 = Number(sound.style.width.split('%')[0]);
        });

        cy.get('#active-sound-track4-25').then($el => {
            const sound = $el.get(0);
            expect(sound.position).to.eq(25);
            expect(sound.style.left).to.eq('25%');
        })

        cy.get('#sound-tracks').then($el => $el.get(0).setDuration(40));

        cy.get('#active-sound-track8-50 select').select('2');
        cy.get('#sound-tracks').then($el => $el.get(0).setStart(8));
        cy.get('#active-sound-track4-25 select').select('4');

        cy.wait(100).get('#active-sound-track2-25').then($el => {
            const sound = $el.get(0);
            expect(sound.position).to.eq(25);
            expect(sound.style.left).to.eq('25%');
            const width1 = Number(sound.style.width.split('%')[0]);
            expect(width0 / 2).to.eq(width1);
        });

        cy.get('#active-sound-track4-20').then($el => {
            const sound = $el.get(0);
            expect(sound.position).to.eq(20);
            expect(sound.style.left).to.eq('20%');
        })

        cy.get('#sound-tracks').find('.sound')
            .should($sounds => expect($sounds.length).to.eq(2));

        cy.get('#active-sound-track2-25 select').select('*');
        cy.get('#active-sound-track2-25').should('not.exist');
        cy.get('#active-sound-track4-20 select').select('*');
        cy.get('#active-sound-track4-20').should('not.exist');

        cy.get('#sound-tracks').find('.sound')
            .should($sounds => expect($sounds.length).to.eq(0));
    });

    it('Positioning active sounds on top of each other', () => {
        cy.visit('/');
        cy.get('#sound-menu .sound').not('.no-audio')
            .first().find('select').select('1');
        cy.get('#sound-menu .sound').not('.no-audio')
            .first().find('select').select('1');
        cy.get('#track1').children().first()
            .should('have.css', 'left').and('match', /0px/);
        cy.wait(100)
        .get('#track1').children().last().then($el => {
            const sound = $el.get(0);
            expect(sound.position).to.eq(sound.width);
        })
    });
});
