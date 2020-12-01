import { createAllSounds } from '../../js/sound-creation.js'

/* These tests don't interact with any URIs. They start with
   `cy.visit('/')` to enable testing async code.*/

function testAllSounds(test) {
    cy.visit('/').then(async () =>
        createAllSounds().then(sounds => sounds.forEach(test)));
}

describe('Initial sound element creation', () => {

    it('First audio and description files exist', () => {
        let times = 3;
        testAllSounds(sound => {
            if (times && sound.files.audio) {
                cy.request(sound.audio.src)
                    .then(resp => expect(resp.status).to.eq(200));
                times--;
            }
            if (times && sound.files.description) {
                cy.request(sound.files.description)
                    .then(resp => expect(resp.status).to.eq(200));
            }
        });
    })

    it('Controls can be toggled', () => {
        let times = 5;
        testAllSounds(sound => {
            if (sound.files.audio && times > 0) {
                cy.get('#' + sound.id + ' input').click();
                cy.get('#' + sound.id + ' audio').then(($el) => {
                    expect($el.get(0).controls).to.eq(true)
                });
                times--;
            }
        });
    })

    it('Audio elements fetch a file when played', () => {
        let times = 5;
        testAllSounds(sound => {
            if (times > 0) {
                let requestedUrl;
                if (sound.files.audio) {
                    cy.route2(sound.audio.src, (req) => {
                        requestedUrl = req.url;
                        req.reply((res) => { res.send(null) });
                    }).as('request-' + sound.id);
                    cy.get('#' + sound.id + ' audio')
                        .then(async ($el) => {
                            const audio = $el.get(0);
                            expect(audio.autoplay).to.eq(false);
                            cy.wait('@request-' + sound.id).then(() => {
                                // FIXME: This fails when running tests in
                                // multiple specs. For some reason only the
                                // first route gets a request.  The second
                                // route is set but the request is not
                                // caught.
                                expect(requestedUrl).to.eq(audio.src);
                            });
                            await audio.play().catch(error => {});
                        });
                    times--;
                }
            }
        });
    })
})
