module.exports = models => {
  const { LocationTag, Photo, User } = models

  User.addScope('defaultScope', {
    include: [{
      model: Photo.scope(null),
      association: User.associations.CurrentProfilePhoto
    }]
  }, { override: true })

  Photo.addScope('defaultScope', {
    include: [{
      model: User,
      as: 'Owner',
      association: Photo.associations.Owner
    }, {
      model: LocationTag,
      association: Photo.associations.LocationTag
    }, {
      association: Photo.associations.LikedUsers
    }]
  }, { override: true })
  Photo.addScope('withOwner', {
    include: [{
      association: Photo.associations.Owner
    }]
  })
  Photo.addScope('withLocation', {
    include: [{
      association: Photo.associations.LocationTag
    }]
  })
}
