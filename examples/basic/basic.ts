import { Qiks } from '../../src/index';

const qiks = new Qiks<string, any>();
qiks.set('user1', { name: 'John' });
console.log(qiks.get('user1')); // { name: 'John' }

qiks.delete('user1');
console.log(qiks.get('user1')); // null
