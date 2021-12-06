import { pactum } from 'testlib/pactum';


describe('PUT /predicate', () => {

  describe('should put "Oswald assassinated JFK"', () => {
    it('JFK exists', async () => {

      await pactum.spec()
        .get('/entity')
        .withQueryParams({ q: 'jfk' })
        .expectStatus(200)
        .expectJsonLike({
          entities: [{
            knownas: 'jfk',
            formalname: 'John Fitzgerald Kennedy',
            "approved": false,
            "dob": null,
            "dod": null,
            "familyname": null,
            "givenname": null,
            id: '#type:number',
            "middlenames": null,
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
            "approved": false,
            "dob": null,
            "dod": null,
            "familyname": null,
            "givenname": null,
            id: '#type:number',
            "middlenames": null,
          }]
        })
    });

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

    it('Sends preicate', async () => {
      await pactum.spec()
        .put('/predicate')
        .withJson({
          Subject: { knownas: 'oswald' },
          Verb: { name: 'assassinates' },
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
