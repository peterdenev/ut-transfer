import test from 'blue-tape';
import React from 'react';
import { mount } from 'enzyme';

import Header from '../../../components/Header/index.js';
import style from '../../../components/Header/style.css';

test('Testing Header Component inside ../components/Header/index.js', t => {
    t.plan(3); // Plan how many asserting you would have

    let props = {
        batchName: 'new',
        batchStatus: 'new'
    };

    const wrapper = mount(<Header {...props} />); // Mock the element you want to test
    t.ok(wrapper.find('span').length === 2, 'Header has 2 span elements');
    t.ok(
        wrapper.find('span').at(1).hasClass(style.status),
        'Header span[1] has a class of .status'
    );
    t.ok(
        wrapper.find('span').at(1).prop('children') === props.batchStatus,
        'Header span[1] renders the needed props'
    );
});
