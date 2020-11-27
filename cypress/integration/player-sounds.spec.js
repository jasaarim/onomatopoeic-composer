import { createActiveSound } from '../../js/player-sounds.js';
import { createSound } from '../../js/sounds.js';
import { fetchSoundNames } from '../../js/sounds.js';


class MockAudioCxt extends AudioContext {

    createMediaElementSource(audio) {
        const source = super.createMediaElementSource(audio);
        source.src = [ decodeURI(audio.src.split(':8000')[1]) ];
        return MockAudioCxt.mockConnect(source);
    }

    createBufferSource() {
        const source = super.createBufferSource();
        source.src = ['buffer'];
        return MockAudioCxt.mockConnect(source);
    }

    createDelay(maxDelay) {
        const delayNode = super.createDelay(maxDelay);
        delayNode.src = ['delay'];
        return MockAudioCxt.mockConnect(delayNode);
    }

    static mockConnect(node) {
        node._connect = node.connect;
        node.connect = (target) => {
            if (!target.src) {
                target.src = [ node.src ];
            } else {
                target.src.push(node.src);
            }
            return node._connect(target);
        }
        return node;
    }

    static create() {
        const mockAudioCxt = new MockAudioCxt();
        cy.get('#sound-tracks').then($el => {
            $el.get(0).audioCxt = mockAudioCxt;
        })
        return mockAudioCxt
    }
}


function testSoundsToTracks(targets, positions, test = () => {}) {
    return cy.visit('/')
        .then(async () => {
            MockAudioCxt.create();
            await fetchSoundNames().then(sounds => {
                for (const name in sounds) {
                    if (targets.length) {
                        const sound = createSound(name, sounds[name])
                        const source = sounds[name];
                        const targetNum = targets.pop();
                        const position = positions.pop();
                        cy.get(`#track${targetNum}`).then(async $el => {
                            await createActiveSound(sound, $el.get(0), position);
                        });
                        test(name, source, targetNum, position);
                    }
                }
            });
    });
}


describe('Sound elements in the player', () => {

    it('Active sounds go to right positions', () => {
        const targets = [2, 2, 5, 5];
        const positions = [10, 40, 20, 70];
        testSoundsToTracks(
            targets, positions,
            (name, source, targetNum, position) => {
                // Check that the left side is in line with the position
                let parentWidth, expected;
                cy.get(`#track${targetNum}`).then(($el) => {
                    parentWidth = Number($el.css('width').split('px')[0]);
                    expected = Math.round(position * parentWidth / 100);
                });
                cy.get(`#active-sound-track${targetNum}-${position}`)
                    .then(($el) => {
                        expect($el.get(0).position).to.eq(position);
                        const left = Number($el.css('left').split('px')[0]);
                        expect(Math.round(left)).to.eq(expected);
                    });
            }
        )
    })

    it('Audio buffer sources connect to Audio Context destination', () => {
        const expectedGraph = [];
        const targets = [2, 2, 5, 5];
        const positions = [10, 40, 20, 70];
        testSoundsToTracks(
            targets, positions,
            (name, source, target, position) => {
                expectedGraph.push(['buffer']);
            }
        ).then(() => {
            cy.get('#sound-tracks').then($el => {
                const audioCxt = $el.get(0).getAudioCxt();
                expect(audioCxt.destination.src).to.deep.equal(expectedGraph);
            })
        });
    });

    it('Player can be played and delays are set correctly', () => {
        const delays = [];
        const targets = [2, 2, 5, 5];
        const positions = [10, 40, 20, 70];
        testSoundsToTracks(
            targets, positions,
            (name, source, target, position) => {
                cy.get(`#active-sound-track${target}-${position}`).then($el => {
                    const sound = $el.get(0);
                    // Mock start
                    sound.audioBuffer._start = sound.audioBuffer.start;
                    sound.audioBuffer.start = (delay) => {
                        const audioCxt =  sound.parentElement
                              .parentElement.audioCxt;
                        delays.push(delay - audioCxt.currentTime);
                        sound.audioBuffer._start(delay);
                    }
                });
            });
        // Change the duration in the player
        cy.get('#sound-tracks')
            .then($el => $el.get(0).setDuration(20));
        cy.get('#play-button').click().contains('Pause');
        cy.get('#sound-tracks').then($el => {
            expect($el.get(0).audioCxt.playing).to.eq(true);
        });
        cy.get('#play-button').click().contains('Play')
            .then(() => expect(delays
                               .sort((a, b) => a - b)
                               .map(d => Math.round(d * 1e6) / 1e6 )
                              ).to.deep.eq([2, 4, 8, 14]));
        cy.get('#sound-tracks').then($el => {
            expect($el.get(0).audioCxt.playing).to.eq(true);
        });
        cy.get('#stop-button').click();
        cy.get('#sound-tracks').then($el => {
            expect($el.get(0).audioCxt.playing).to.eq(false);
        });
    });

    it('Moving active sounds, also to before 0 seconds', () => {
        const delays = [];
        const offsets = [];
        const targets = [2, 2, 5, 5];
        const positions = [10, 40, 20, 70];
        const moveTargets = [1, 2, 4, 6];
        const movePositions = [90, 30, 20, -10];
        testSoundsToTracks(
            targets, positions,
            (name, source, target, position) => {
                const moveTarget = moveTargets.pop();
                const movePosition = movePositions.pop();
                cy.get(`#active-sound-track${target}-${position}`).then($el => {
                    const sound = $el.get(0);
                    // Mock start
                    sound.audioBuffer._start = sound.audioBuffer.start;
                    sound.audioBuffer.start = (delay, offset) => {
                        const audioCxt =  sound.parentElement
                              .parentElement.audioCxt;
                        delays.push(delay - audioCxt.currentTime);
                        offsets.push(offset);
                        sound.audioBuffer._start(delay, offset);
                    };
                    // Move the sound
                    cy.get(`#track${moveTarget}`).then($el2 => {
                        sound.move($el2.get(0), movePosition);
                    });
                });
                cy.get(`#active-sound-track${moveTarget}-${movePosition}`)
                    .then($el => {
                        const sound = $el.get(0);
                        expect(sound.position).to.eq(movePosition);
                    });
            });
        // Change the duration in the player
        cy.get('#sound-tracks').then($el => $el.get(0).setDuration(20));
        cy.get('#play-button').click().contains('Pause');
        cy.get('#play-button').click().contains('Play')
            .then(() => expect(delays
                               .sort((a, b) => a - b)
                               .map(d => Math.round(d * 1e6) / 1e6 )
                              ).to.deep.eq([0, 4, 6, 18]))
            .then(() => expect(offsets
                               .sort((a, b) => a - b)
                               .map(d => Math.round(d * 1e6) / 1e6 )
                              ).to.deep.eq([0, 0, 0, 2]));
        cy.get('#stop-button').click();
    });

    it('Starting from a different position', () => {
        const delays = [];
        const offsets = [];
        const targets = [8, 2, 5, 8];
        const positions = [-50, 10, 20, 60];
        testSoundsToTracks(
            targets, positions,
            (name, source, target, position) => {
                cy.get(`#active-sound-track${target}-${position}`).then($el => {
                    const sound = $el.get(0);
                    // Mock start
                    sound.audioBuffer._start = sound.audioBuffer.start;
                    sound.audioBuffer.start = (delay, offset) => {
                        const audioCxt =  sound.parentElement
                              .parentElement.audioCxt;
                        delays.push(delay - audioCxt.currentTime);
                        offsets.push(offset);
                        sound.audioBuffer._start(delay, offset);
                    };
                });
            });
        // Change the duration in the player
        cy.get('#sound-tracks').then($el => $el.get(0).setDuration(5));
        cy.get('#sound-tracks').then($el => $el.get(0).setStart(1));
        cy.get('#active-sound-track5-20').then($el1 => {
            cy.get('#cursor').then($el2 => {
                expect($el1.css('left')).to.eq($el2.css('left'));
            })
        })
        cy.get('#play-button').click().contains('Pause');
        cy.get('#play-button').click().contains('Play')
            .then(() => expect(delays
                               .sort((a, b) => a - b)
                               .map(d => Math.round(d * 1e6) / 1e6 )
                              ).to.deep.eq([0, 0, 0, 2]))
            .then(() => expect(offsets
                               .sort((a, b) => a - b)
                               .map(d => Math.round(d * 1e6) / 1e6 )
                              ).to.deep.eq([0, 0, 0.5, 3.5]));
        cy.get('#stop-button').click();
        cy.get('#sound-tracks').then($el => expect($el.get(0).start).to.eq(0));
        cy.get('#cursor').then($el => {
            expect($el.get(0).style.left).to.eq('0%');
            expect($el.css('left')).to.eq('0px');
        });
    });

})
