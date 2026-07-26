import { isChinaMobile } from './validation/phone';

describe('isChinaMobile', () => {
  it.each(['13800138000', '19912345678'])('accepts valid mobile %s', (phone) => {
    expect(isChinaMobile(phone)).toBe(true);
  });

  it.each(['1380013800', '138001380000', '12800138000', '1380013800a'])(
    'rejects invalid mobile %s',
    (phone) => {
      expect(isChinaMobile(phone)).toBe(false);
    },
  );
});
