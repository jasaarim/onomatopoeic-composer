describe('Cursor in the player', () => {

    it('Cursor position is set by default', () => {
        cy.visit('/');
        cy.get('#cursor').then($el => {
            let left = Number($el.css('left').split('px')[0]);
            expect(left).to.eq(0);
            expect($el.get(0).start).to.eq(0);
        });
    });

    it('Cursor from start to finish', () => {
        cy.visit('/');
        // Change the duration to 500 ms
        let playerWidth;
        cy.get('#sound-tracks').then($el => {
            $el.get(0).setDuration(0.5);
            playerWidth = Number($el.css('width').split('px')[0]);
        });
        cy.get('#cursor').then($el => {
            let left = Number($el.css('left').split('px')[0]);
            left = Math.round(left / playerWidth * 100);
            expect(left).to.eq(0);
            expect($el.get(0).parentElement.start * 200).to.eq(left);
        });
        // Estimate how much time it takes for the cursor to travel across
        let startTime;
        cy.get('#play-button').click()
            .then(() => {
                startTime = new Date();
            })
            .contains('Play')
            .then(() => {
                const endTime = new Date();
                const elapsed = endTime - startTime;
                expect(elapsed).to.gt(400).and.to.lt(600);
            });
    });

    it('Cursor in a different starting point', () => {
        let playerWidth, startTime;
        cy.visit('/')
        // Wait a little so that the initial time will be set to 0
            .wait(100)
        // Change the duration to 800 ms to start to 200 ms
            .get('#sound-tracks').then($el => {
                $el.get(0).setDuration(0.8);
                $el.get(0).setStart(0.2);
                playerWidth = Number($el.css('width').split('px')[0]);
                expect($el.get(0).start).to.eq(0.2);
            })
            .get('#cursor').then($el => {
                let left = Number($el.css('left').split('px')[0]);
                left = Math.round(left / playerWidth * 100);
                expect(left).to.eq(25);
                expect($el.get(0).parentElement.start * 125).to.eq(left);
            })

            .get('#input-start').should('have.value', '25')
            .get('#play-button').click().then(() => {
                startTime = new Date();
            })
            .contains('Play')
            .then(() => {
                const endTime = new Date();
                const elapsed = endTime - startTime;
                expect(elapsed).to.gt(500).and.to.lt(700);
            });
    });

    it('Starting point and duration from the input fields', () => {
        cy.visit('/');
        cy.get('#input-duration').should('have.value', '10')
        cy.get('#input-start').should('have.value', '0');
        // Set duration from input
        cy.get('#input-duration').type('{backspace}{backspace}20{enter}');
        cy.get('#sound-tracks')
            .then($el => expect($el.get(0).duration).to.eq('20'));
        // Set start from the function
        cy.get('#sound-tracks').then($el => $el.get(0).setStart(5));
        cy.get('#input-start').should('have.value', '25')
        // Set start from input
            .type('{backspace}{backspace}40{enter}');
        cy.get('#sound-tracks')
            .then($el => expect($el.get(0).start).to.eq(8));
        // Set duration from the function
        cy.get('#sound-tracks').then($el => $el.get(0).setDuration(30));
        cy.get('#input-duration').should('have.value', '30')
        cy.get('#input-start').should('have.value', '40');
    });

});
