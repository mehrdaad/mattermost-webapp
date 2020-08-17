// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @messaging

describe('Messaging', () => {
    before(() => {
        // # Login as test user and visit the newly created test channel
        cy.apiInitSetup({loginAfter: true}).then(({team, channel}) => {
            // # Visit a test channel
            cy.visit(`/${team.name}/channels/${channel.name}`);
        });
    });

    it('MM-T188 - Inline markdown image that is a link, opens the link', () => {
        // # Enable 'Show markdown preview option in message input box' setting in Account Settings > Advanced
        cy.get('.sidebar-header-dropdown__icon').click();

        // # Click on 'Account Settings'
        cy.findByText('Account Settings').should('be.visible').click();

        // * Check that the 'Account Settings' modal was opened
        cy.get('#accountSettingsModal').should('exist').within(() => {
            // # Click on the 'Advanced' tab
            cy.findByText('Advanced').should('be.visible').click();

            // # Click on the 'Advanced Preview Features Edit' button and check the 'Show markdown preview option in message input box' and save
            cy.get('#advancedPreviewFeaturesEdit').should('be.visible').click();
            cy.get('#advancedPreviewFeaturesmarkdown_preview').check();
            cy.findByText('Save').should('be.visible').click();

            // # Close the modal
            cy.get('#accountSettingsHeader').find('button').should('be.visible').click();
        });

        const linkUrl = 'https://travis-ci.org/mattermost/platform';
        const imageUrl = 'https://travis-ci.org/mattermost/platform.svg?branch=master';
        const label = 'Build Status';
        const baseUrl = Cypress.config('baseUrl');

        // # Post the provided Markdown text in the test channel
        cy.postMessage(`[![${label}](${imageUrl})](${linkUrl})`);

        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).find('a').then(($a) => {
                // * Check that the newly created post contains an a tag with the correct href link and target
                cy.wrap($a).
                    should('have.attr', 'href', linkUrl).
                    and('have.attr', 'target', '_blank');

                // * Check that the newly created post has an image
                cy.wrap($a).find('img').should('be.visible').
                    and('have.attr', 'src', `${baseUrl}/api/v4/image?url=${encodeURIComponent(imageUrl)}`).
                    and('have.attr', 'alt', label);

                // # Assign the value of the a tag href to the 'href' variable and assert the link is valid
                // eslint-disable-next-line jquery/no-prop
                const href = $a.prop('href');
                cy.request(href).its('body').should('include', '</html>');
            });
        });
    });
});