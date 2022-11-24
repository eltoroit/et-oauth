import '@lwc/synthetic-shadow';
import { createElement } from 'lwc';
import myHome from 'c/home';

// eslint-disable-next-line @lwc/lwc/no-document-query
document.querySelector('#main').appendChild(createElement('my-home', { is: myHome }));
