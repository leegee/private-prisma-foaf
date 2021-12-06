import { pactum } from 'testlib/pactum';


describe('PUT /predicate', () => {

  describe('should put "Oswald assassinates JFK"', () => {
    it('JFK exists', async () => {

      await pactum.spec()
        .get('/entity')
        .withQueryParams({ q: 'jfk' })
        .expectStatus(200)
        .expectJsonLike({
          entities: [{
            knownas: 'jfk',
            formalname: 'john f kennedy',
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
            formalname: 'lee harvey oswald',
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

  });

});
