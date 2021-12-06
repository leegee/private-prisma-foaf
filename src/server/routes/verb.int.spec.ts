import { pactum } from 'testlib/pactum';


describe('PUT /predicate', () => {

  describe('should put "Oswald assassinated JFK"', () => {
    it('Verb "assassinates" exists', async () => {
      await pactum.spec()
        .get('/verb')
        .withQueryParams({ q: 'assassinates' })
        .expectStatus(200)
        .expectJsonLike({
          verbs: [{
            name: 'assassinates',
            id: '#type:number',
          }]
        })
    });
  });
});

