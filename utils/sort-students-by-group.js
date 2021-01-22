const sortStudentsByGroup = (unsortedStudents) => {
  const groups = []

  unsortedStudents.forEach(user => {
    if (!user.groupName) return

    const groupIndex = groups.findIndex(group => group.name === user.groupName)
    if (groupIndex > -1) return groups[groupIndex].students.push(user)

    // Create & add group with student
    groups.push({ name: user.groupName, _id: user.group._id, temporaryGroupName: user.groupName, students: [user] })
  })

  return groups.sort(groupNameSort)
}

const groupNameSort = (a, b) => {
  if (a.name < b.name) { return -1 }
  if (a.name > b.name) { return 1 }
  return 0
}

export default sortStudentsByGroup
