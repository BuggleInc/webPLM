# BEGIN TEMPLATE
def last(list):
  # BEGIN SOLUTION
  if list == None:
    return list.head
  return last(list.tail)
  # END SOLUTION
# END TEMPLATE
