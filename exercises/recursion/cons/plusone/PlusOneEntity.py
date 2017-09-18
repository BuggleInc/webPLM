# BEGIN TEMPLATE
def plusOne(list):
  # BEGIN SOLUTION
  if list.tail == None:
    return None
  return new RecList(list.head+1, plusOne(list.tail))
  # END SOLUTION
# END TEMPLATE
