## Heroku

    heroku config:set API_KEY=... API_SECRET='...'

> NOTES: Avoid '$' in API_SECRET or any other characters with special meaning on command line

## ICrew API
### Get Available Shells



### Get Available Oars

### Make a Reservation

`POST apiv1.php/reservations`

Form data:

* `cmsaid`: Member ID (`membersaid:uuid`)
* `cssaid`: Shell ID
* `coarsaid`: Oar ID (optional)
* `resdata`: Reservation date (`YYYY-MM-DD`)
* `starttime`: Reservation start (`hh:mm:ss`)
* `endtime`: Reservation end (`hh:mm:ss`)
* `note`: Optional note
* `type`: Boat type (`boattype || 'sc'`)
* `cressaid`: Reservation ID? (set to locally generated UUID)

Headers:

* `'x-icrew-action': 'create'`
* `'x-icrew-apikey': APIkey`
* `'x-icrew-apisecret': APIsecret`
* `Authorization: Basic ${autzToken}`

Example

```javascript
{
  cmsaid: "2bd19e66-be6e-c1cf-6bd6-6adc12600000",
  cssaid: "fbfa1e2d-a5de-11e7-8c9e-008cfa500000",
  coarsaid: "907d75ef-a5e1-11e7-8c9e-008cfa500000",
  resdate: "2020-06-07",
  starttime: "06:45:00",
  endtime: "08:15:00",
  note: "",
  type: "sc",
  cressaid: "95e40724-950e-4e6f-b6e2-a37113400000",
}
```

#### Response

```javascript
{
  "status": "ok",
  "code": 200,
  "message": "Reservation record created",
  "data": ""
}
```

### Get Reservations

    GET https://www.icrew.club/rescalendardata
      ?crewOrg=NSRC
      &start=2020-05-31
      &end=2020-06-07

> Note: Requires cookie `PHPSESSID=${sessionId}`

#### Reply 

```javascript
[
  {
    "id": "bb76986b-7214-4bc3-b962-7da1666fdb9e",
    "url": "crewreservation?crewRes=bb76986b-7214-4bc3-b962-7da1666fdb9e",
    "name": "Club 8 (1) \/ Club 8 - Max O",
    "color": "#1B4367",
    "summary": "",
    "title": "Club 8 (1) \/ Club 8 - Max O",
    "start": "2020-05-16T07:00:00+00:00",
    "end": "2020-05-16T08:30:00+00:00"
  },
  ...
]
```

