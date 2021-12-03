import { pactum } from 'testlib/pactum';


describe('PUT /predicate', () => {

  describe('should put "Oswald assassinated JFK"', () => {
    it('JFK exists', async () => {
      await pactum.spec()
        .get('/entity')
        .withQueryParams({ q: 'jfk' })
        .expectStatus(200)
        .expectJson({
          entities: [{
            knownas: 'jfk',
            formalname: 'John Fitzgerald Kennedy',
          }]
        })
    });

    it('Oswald exists', async () => {
      await pactum.spec()
        .get('/entity')
        .withQueryParams({ q: 'oswald' })
        .expectStatus(200)
        .expectJson({
          entities: [{
            knownas: 'oswald',
            formalname: 'Lee Harvey Oswald',
          }]
        })
    });

    it('Verb "assinates" exists', async () => {
      await pactum.spec()
        .get('/verb')
        .withQueryParams({ q: 'assinates' })
        .expectStatus(200)
        .expectJson({
          verbs: [{
            name: 'assinates',
          }]
        })
    });

    it('Sends preicate', async () => {
      await pactum.spec()
        .put('/predicate')
        .withJson({
          Subject: { knownas: 'oswald' },
          Verb: { name: 'assinates' },
          Object: { knownas: 'jfk' },
        })
        .expectStatus(201);
    });

    // .post('/entity/jfk')
    // .withJson({
    //   formalname: "John Test Kennedy"
    // })
    // .expectStatus(200)
    // .useInteraction({
    //   request: {
    //     method: 'GET',
    //     path: '/entity',
    //     queryParams: { q: 'jfk' }
    //   },
    //   response: {
    //     status: 200,
    //     body: [{
    //       knownas: 'jfk',
    //       formalname: "John Test Kennedy",
    //     }]
    //   }
    // });
  });

});
