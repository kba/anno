const tap = require('tap')
const AnnoAclRules = require('.')
process.ANNO_DEBUG = false

tap.test('acl', t => {
    const acl = new AnnoAclRules()
    function allow(ctx, msg) { acl.check(ctx, (err, pass) => t.ok(pass, "allow: "+JSON.stringify(ctx))) }
    function forbid(ctx, msg) { acl.check(ctx, (err, pass) => t.ok(err, "forbid: "+JSON.stringify(ctx))) }

    forbid({})
    allow({method:'get'})
    forbid({method:'get', user: 'spambot3000'})
    allow({method:'search'})
    forbid({method:'create'})
    allow({collection:'test-collection'})
    allow({method:'create',collection:'test-collection'})
    allow({method:'create',user:{role:'admin'}})
    allow({method:'revise',user:{id:'john@doe'},anno:{creator:'john@doe'}})
    forbid({method:'revise',user:{id:'nolan'},anno:{creator:'john@doe'}})
    allow({method:'create',user:{perm:[{collection:'default', role:['create']}]}})
    allow({method:'revise',user:'mike'})
    allow({method:'create',user:'john'})
    allow({method:'create',user:{id:'john'}})
    t.end()
})
