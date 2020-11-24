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
            .then(() => { startTime = new Date(); })
            .contains('Play')
            .then(() => {
                const endTime = new Date();
                const elapsed = endTime - startTime;
                expect(elapsed).to.gt(400).and.to.lt(600);
        });
    });

    it('Cursor in a different starting point', () => {
        cy.visit('/');
        // Change the duration to 500 ms to start to 200 ms
        let playerWidth;
        cy.get('#sound-tracks').then($el => {
            $el.get(0).setDuration(0.5);
            $el.get(0).setStart(0.2);
            playerWidth = Number($el.css('width').split('px')[0]);
        });
        cy.get('#cursor').then($el => {
            let left = Number($el.css('left').split('px')[0]);
            left = Math.round(left / playerWidth * 100);
            expect(left).to.eq(40);
            expect($el.get(0).parentElement.start * 200).to.eq(left);
        })
        // Estimate how much time it takes for the cursor to travel across
        let startTime;
        cy.get('#play-button').click()
            .then(() => { startTime = new Date(); })
            .contains('Play')
            .then(() => {
                const endTime = new Date();
                const elapsed = endTime - startTime;
                expect(elapsed).to.gt(200).and.to.lt(400);
        });
    });

});
