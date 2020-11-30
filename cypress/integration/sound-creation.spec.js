import { processAllSounds } from '../../js/sounds.js'


function testProcessAllSounds(test) {
        cy.visit('/').then(async () => {
            await processAllSounds(test);
        });
}

describe('Initial sound element creation', () => {

    it('ProcessAllSounds does something', () => {
        cy.visit('/').then(async () => {
            const sounds = [];
            await processAllSounds(sound => sounds.push(sound));
            expect(sounds).not.to.be.empty;
        })
    })

    /* This takes too long with all the files

    it('All audio and description files exist', () => {
        testProcessAllSounds(async sound => {
            if (sound.files.audio) {
                cy.request(sound.audio.src)
                    .then(resp => expect(resp.status).to.eq(200));
            }
            if (sound.files.description) {
                cy.request(sound.files.description)
                    .then(resp => expect(resp.status).to.eq(200));
            }
        });
    })
    */

    it('Controls can be toggled', () => {
        let times = 5;
        testProcessAllSounds(sound => {
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
        testProcessAllSounds(sound => {
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
