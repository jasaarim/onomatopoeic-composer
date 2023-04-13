describe('Moving sounds', () => {
    it('Adding sounds from menu to the player', () => {
        cy.visit('/');
        cy.get('#sound-menu .sound.no-audio').first()
            .find('.add-button').should('be.disabled');
        cy.get('#sound-menu .sound').not('.no-audio').first()
            .find('.add-button').click();
        cy.get('#sound-menu .sound').not('.no-audio').first()
            .type('{enter}')
            .type('{rightArrow}{rightArrow}{rightArrow}{leftArrow}')
            .type('{enter}')
            .type('{enter}')
            .type('{enter}')
            .type('{enter}')
            .type('{enter}')
            .type('{enter}')
            .type('{enter}');
        cy.get('#player').find('.sound')
            .should($sounds => expect($sounds.length).to.eq(9));
        cy.get('#track1').find('.sound')
            .should($sounds => expect($sounds.length).to.eq(2));
        cy.get('#track3 .sound').then($el => {
            expect(Math.round($el.get(0).position * 1000) / 1000).to.eq(2);
        });
    })

    it('Adding a sound to the end', () => {
        let arrows = '';
        for (let i = 0; i < 49; i++)
            arrows += '{rightArrow}';
        cy.visit('/');
        cy.get('#player-tracks').click();
        cy.get('#sound-menu .sound').not('.no-audio').first()
            .find('.add-button').click().type(arrows).click();
        cy.get('#player .sound').not('.initial').then($el => {
            let expected = $el.get(0).bufferSource.buffer.duration + 19.8;
            expected = Math.round(expected * 100) / 100;
            cy.get('#player').then($el2 => {
                expect(Math.round($el2.get(0).duration * 100) / 100)
                    .to.eq(expected)
            });
        });
    });

    it('Adding and moving sounds by dragging', () => {
        cy.visit('/');
        let targetY, targetX, targetY2;
        cy.get('#player').then($el => {
            targetY = $el.get(0).querySelector('#track3')
                .getBoundingClientRect().top;
            targetX = $el.get(0).querySelector('#track3')
                .getBoundingClientRect().left;
            targetY2 = $el.get(0).querySelector('#track4')
                .getBoundingClientRect().top;
        }).then(() => {
            cy.get('#sound-menu .sound').not('.no-audio').first()
                .trigger('pointerdown', { pointerId: 1, force: true } )
                .wait(350)
                .trigger('pointermove', { pageX: Math.round(targetX) + 200,
                                          pageY: Math.round(targetY)})
                .trigger('pointerup', { pageX: Math.round(targetX) + 200,
                                        pageY: Math.round(targetY)});

            cy.get('#sound-menu .sound').not('.no-audio').first()
                .trigger('pointerdown', { pointerId: 1, force: true } )
                .wait(350)
                .trigger('pointermove', { pageX: Math.round(targetX) + 200,
                                          pageY: Math.round(targetY),
                                          force: true })
                .trigger('pointerup', { pageX: Math.round(targetX) + 200,
                                        pageY: Math.round(targetY)});

            cy.get('#player .sound').first()
                .trigger('pointerdown', { pointerId: 1, force: true } )
                .wait(350)
                .trigger('pointermove', { pageX: Math.round(targetX) + 200,
                                          pageY: Math.round(targetY2),
                                          force: true })
                .trigger('pointerup', { pageX: Math.round(targetX) + 200,
                                        pageY: Math.round(targetY2)});
        });
        cy.get('#track3').find('.sound')
            .should($sounds => expect($sounds.length).to.eq(1));
        cy.get('#track4').find('.sound')
            .should($sounds => expect($sounds.length).to.eq(1));
    });
});
